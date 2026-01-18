'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';

interface Place {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface RouteMapComponentProps {
  places: Place[];
  selectedPlaceIndex: number | null;
  onPlaceClick?: (index: number) => void;
  initialCityName?: string | null;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 37.5665,
  lng: 126.9780,
};

export default function RouteMapComponent({ 
  places, 
  selectedPlaceIndex, 
  onPlaceClick,
  initialCityName 
}: RouteMapComponentProps) {
  const [map, setMap] = useState<any>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(defaultCenter);

  // 실제 좌표가 있는 장소들만 필터링
  const validPlaces = useMemo(() => {
    return places.filter(p => p.latitude != null && p.longitude != null);
  }, [places]);

  // 지도 중심 설정 (첫 번째 장소 또는 도시)
  useEffect(() => {
    if (validPlaces.length > 0) {
      setCenter({
        lat: validPlaces[0].latitude!,
        lng: validPlaces[0].longitude!,
      });
    } else if (initialCityName && typeof window !== 'undefined') {
      // Google Maps API가 로드될 때까지 기다림
      let retryCount = 0;
      const maxRetries = 50;
      const checkGoogleMaps = () => {
        if ((window as any).google && (window as any).google.maps) {
          const geocoder = new (window as any).google.maps.Geocoder();
          geocoder.geocode({ address: initialCityName }, (results: any, status: string) => {
            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              setCenter({
                lat: location.lat(),
                lng: location.lng(),
              });
            }
          });
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkGoogleMaps, 100);
        }
      };
      checkGoogleMaps();
    }
  }, [validPlaces, initialCityName]);

  // Polyline 경로 좌표 생성
  const path = useMemo(() => {
    return validPlaces.map(place => ({
      lat: place.latitude!,
      lng: place.longitude!,
    }));
  }, [validPlaces]);

  const onLoad = useCallback((map: any) => {
    setMap(map);
    
    // 모든 마커가 보이도록 bounds 조정
    if (validPlaces.length > 0 && map && typeof window !== 'undefined' && (window as any).google) {
      const google = (window as any).google;
      const bounds = new google.maps.LatLngBounds();
      validPlaces.forEach(place => {
        bounds.extend(new google.maps.LatLng(place.latitude!, place.longitude!));
      });
      map.fitBounds(bounds);
      
      // 줌 레벨이 너무 크면 최대 줌 제한
      const listener = google.maps.event.addListener(map, 'bounds_changed', () => {
        if (map.getZoom()! > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [validPlaces]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          color: '#666',
          fontSize: '14px',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <div>
          <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            ⚠️ Google Maps API 키가 설정되지 않았습니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* 선택한 장소들을 순서대로 마커 표시 */}
        {validPlaces.map((place, index) => {
          const isSelected = selectedPlaceIndex === index;
          
          return (
            <Marker
              key={`place-${index}`}
              position={{
                lat: place.latitude!,
                lng: place.longitude!,
              }}
              label={{
                text: `${index + 1}`,
                color: 'white',
                fontWeight: 'bold',
              }}
              onClick={() => onPlaceClick?.(index)}
              // animation은 LoadScript가 완전히 로드된 후에만 작동하므로 제거
            />
          );
        })}

        {/* 장소들을 점선으로 연결 */}
        {path.length > 1 && (
          <Polyline
            path={path}
            options={{
              strokeColor: '#777777',
              strokeOpacity: 0.8,
              strokeWeight: 4, // 두께 증가 (2 -> 4)
              icons: [{
                icon: {
                  path: 'M 0,-2 0,2', // 더 두꺼운 점선을 위해 길이 증가
                  strokeOpacity: 1,
                  strokeWeight: 4, // 두께 증가
                  scale: 6, // 스케일 증가
                  strokeColor: '#777777',
                },
                offset: '0%',
                repeat: '25px', // 간격 증가
              }] as any, // TypeScript 타입 체크 우회
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}
