'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import LocationSearchInput from './components/LocationSearchInput';

// 구글 맵을 클라이언트 사이드에서만 로드 (SSR 방지)
const GoogleMapComponent = dynamic(
  () => import('./components/GoogleMapComponent'),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }}>지도 로딩 중...</div> }
);

export default function Page() {
  const router = useRouter();
  const [selectedPlaces, setSelectedPlaces] = useState<
    { name: string; address: string; latitude: number; longitude: number; image?: string }[]
  >([]);
  const [currentPin, setCurrentPin] = useState<{ name: string; address: string; latitude: number; longitude: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [initialCity, setInitialCity] = useState<string | null>(null);
  const [cityCenter, setCityCenter] = useState<{ lat: number; lng: number } | null>(null);

  // popular에서 선택한 도시 정보 읽기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const selectedCitiesStr = sessionStorage.getItem('selectedCities');
      if (selectedCitiesStr) {
        try {
          const selectedCities = JSON.parse(selectedCitiesStr);
          if (selectedCities && selectedCities.length > 0) {
            // 첫 번째 선택된 도시로 초기 중심 설정
            setInitialCity(selectedCities[0].name);
          }
        } catch (e) {
          console.error('Failed to parse selected cities', e);
        }
      }
    }
  }, []);

  // 도시 중심 좌표 변경 핸들러
  const handleCityCenterChange = useCallback((center: { lat: number; lng: number } | null) => {
    setCityCenter(center);
    // sessionStorage에 도시 좌표 저장 (optimize/places에서 사용)
    if (center && typeof window !== 'undefined') {
      sessionStorage.setItem('cityCenter', JSON.stringify(center));
    }
  }, []);

  const handleSelect = (place: { name: string; address: string; latitude: number; longitude: number }) => {
    const isDuplicate = selectedPlaces.some(
      (p) => p.name === place.name && p.address === place.address
    );
    if (!isDuplicate) {
      setSelectedPlaces((prev) => [...prev, { ...place, image: "/icons/blank.png" }]);
    }
    setCurrentPin(place);
    setIsSearching(false);
  };

  const handleRemove = (index: number) => {
    const updated = [...selectedPlaces];
    const removed = updated.splice(index, 1)[0];
    setSelectedPlaces(updated);

    if (currentPin && removed.name === currentPin.name) {
      setCurrentPin(null);
    }
  };

  const handleActionClick = () => {
    if (selectedPlaces.length === 0 && currentPin) {
      const isDuplicate = selectedPlaces.some(
        (place) => place.name === currentPin.name && place.address === currentPin.address
      );
      if (!isDuplicate) {
        setSelectedPlaces([{ ...currentPin, image: "/icons/blank.png" }]);
      }
    }
    
    if (selectedPlaces.length > 0) {
      // 선택한 장소들을 sessionStorage에 저장
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedPlaces', JSON.stringify(selectedPlaces));
      }
      router.push('/optimize/route');
    }
  };

  const handleClear = () => {
    setCurrentPin(null);
    setIsSearching(false);
  };

  const handleSearchStart = () => {
    setIsSearching(true);
  };

  return (
    <FullScreenContainer>
      {/* 구글 맵 배경 */}
      <MapContainer>
        <GoogleMapComponent 
          selectedPlace={currentPin}
          selectedPlaces={selectedPlaces}
          initialCityName={initialCity}
          onCityCenterChange={handleCityCenterChange}
        />
      </MapContainer>

      <OverlayContent>
        {/* 모바일 스타일 헤더 - 화면 전체 너비 */}
        <MobileHeader>
          <HeaderContent>
            <BackButton onClick={() => router.back()}>
              <ArrowIcon src="/icons/Larrow.png" alt="back" />
            </BackButton>
            <HeaderText>장소 추가하기</HeaderText>
          </HeaderContent>
        </MobileHeader>

        {/* 검색바 섹션 */}
        <SearchSection>
          <LocationSearchInput
            onSelect={handleSelect}
            selectedPlaces={selectedPlaces}
            onClear={handleClear}
            onSearchStart={handleSearchStart}
            searchCenter={cityCenter}
          />
        </SearchSection>

        {/* 하단 액션 섹션 - 검색 중일 때는 숨김 */}
        {!isSearching && (
          <BottomActionSection>
            {selectedPlaces.length > 0 && (
              <SelectedPlacesList>
                {selectedPlaces.map((place, index) => (
                  <SelectedPlaceItem key={index}>
                    <PlaceThumbnail src={place.image || "/icons/blank.png"} alt="thumb" />
                    <PlaceLabel>장소 {index + 1}</PlaceLabel>
                    <RemoveButton onClick={() => handleRemove(index)}>✕</RemoveButton>
                  </SelectedPlaceItem>
                ))}
                <EditButton>편집</EditButton>
              </SelectedPlacesList>
            )}
                         <AddButton onClick={handleActionClick}>
               {selectedPlaces.length === 0 ? '추가' : '추가 완료'}
             </AddButton>
          </BottomActionSection>
        )}
      </OverlayContent>
    </FullScreenContainer>
  );
}

const FullScreenContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
`;

const MapContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const OverlayContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  box-sizing: border-box;
  z-index: 1;
  pointer-events: none; // 지도 클릭 가능하도록

  // 자식 요소들은 클릭 가능하도록
  > * {
    pointer-events: auto;
  }
`;

const MobileHeader = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 100%;
  padding: 0;
  margin: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;


const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ArrowIcon = styled.img`
  width: 20px;
  height: 20px;
`;

const HeaderText = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1C1C1C;
  flex: 1;
`;

const SearchSection = styled.div`
  margin: 16px 16px 0 16px;
`;

const BottomActionSection = styled.div`
  margin-top: auto;
  padding: 16px 20px;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;
  background: white;
  border-top: 1px solid #e9ecef;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const SelectedPlacesList = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 11px;
  margin-bottom: 11px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
`;

const SelectedPlaceItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  flex-shrink: 0;
  padding-top: 5px;
`;

const PlaceThumbnail = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PlaceLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-align: center;
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 1px;
  right: -4px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: #ff3742;
    transform: scale(1.1);
  }
`;

const EditButton = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f8f9fa;
  color: #666;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    color: #495057;
  }
`;

const AddButton = styled.button`
  width: 100%;
  max-width: 560px;
  padding: 18px 0;
  background: #3CA6FF;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 11px auto 0 auto;
  display: block;

  &:hover {
    background: #3295e6;
  }

  &:active {
    background: #2884cc;
  }
`;

