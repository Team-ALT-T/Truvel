'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface GoogleMapComponentProps {
  selectedPlace?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  } | null;
  selectedPlaces?: Array<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }>;
  initialCityName?: string | null;
  onCityCenterChange?: (center: { lat: number; lng: number } | null) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// 기본 중심 좌표 (서울)
const defaultCenter = {
  lat: 37.5665,
  lng: 126.9780,
};

const GoogleMapComponent = ({ selectedPlace, selectedPlaces = [], initialCityName, onCityCenterChange }: GoogleMapComponentProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [cityCenter, setCityCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingCity, setIsLoadingCity] = useState(false);

  // 구글 맵 API 로드 완료 후 초기 도시 좌표 얻기
  const handleMapLoad = useCallback(() => {
    if (initialCityName && !cityCenter && typeof window !== 'undefined' && window.google) {
      setIsLoadingCity(true);
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: initialCityName }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const newCenter = {
            lat: location.lat(),
            lng: location.lng(),
          };
          setCityCenter(newCenter);
          onCityCenterChange?.(newCenter);
          console.log(`📍 ${initialCityName} 좌표:`, newCenter);
        } else {
          console.error('❌ Geocoding 실패:', status);
        }
        setIsLoadingCity(false);
      });
    }
  }, [initialCityName, cityCenter, onCityCenterChange]);

  // 현재 표시할 중심 좌표 결정 (우선순위: 선택된 장소 > 선택된 장소 목록 > 초기 도시 > 기본 위치)
  const center = selectedPlace
    ? { lat: selectedPlace.latitude, lng: selectedPlace.longitude }
    : selectedPlaces.length > 0
    ? { lat: selectedPlaces[0].latitude, lng: selectedPlaces[0].longitude }
    : cityCenter || defaultCenter;

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // API 키 확인
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
          <p style={{ fontSize: '12px', lineHeight: '1.5' }}>
            frontend/.env.local 파일에<br />
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY를 설정해주세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={apiKey}
      onLoad={handleMapLoad}
    >
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
        {/* 현재 선택된 장소에 마커 표시 */}
        {selectedPlace && (
          <>
            <Marker
              position={{
                lat: selectedPlace.latitude,
                lng: selectedPlace.longitude,
              }}
              animation={google.maps.Animation.DROP}
            />
            <InfoWindow
              position={{
                lat: selectedPlace.latitude,
                lng: selectedPlace.longitude,
              }}
              options={{
                pixelOffset: new google.maps.Size(0, -35), // 마커 위에 표시
              }}
            >
              <div
                style={{
                  background: 'white',
                  padding: '1px 12px',
                  borderRadius: '6px',
                  maxWidth: '280px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '2px',
                    color: '#1C1C1C',
                    lineHeight: '1.1',
                  }}
                >
                  {selectedPlace.name}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#1C1C1C',
                    lineHeight: '1.4',
                  }}
                >
                  {selectedPlace.address}
                </div>
              </div>
            </InfoWindow>
          </>
        )}

        {/* 선택된 모든 장소에 마커 표시 */}
        {selectedPlaces.map((place, index) => (
          <Marker
            key={`${place.name}-${index}`}
            position={{
              lat: place.latitude,
              lng: place.longitude,
            }}
            label={{
              text: `${index + 1}`,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default memo(GoogleMapComponent);

