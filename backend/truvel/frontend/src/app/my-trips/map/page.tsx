'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import LocationSearchInput from './components/LocationSearchInput';

export default function Page() {
  const router = useRouter();
  const [selectedPlaces, setSelectedPlaces] = useState<
    { name: string; address: string; image?: string }[]
  >([]);
  const [currentPin, setCurrentPin] = useState<{ name: string; address: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSelect = (place: { name: string; address: string }) => {
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
      router.push('/my-trips/optimize');
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
    <FullScreenBackground>
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
          />
        </SearchSection>

        {/* 현재 선택된 장소 핀과 정보 박스 */}
        {currentPin && !isSearching && (
          <PinAndBoxWrapper>
            <BoxBackground src="/icons/box.png" alt="box" />
            <BoxContent>
              <PlaceName>{currentPin.name}</PlaceName>
              <PlaceAddress>{currentPin.address}</PlaceAddress>
            </BoxContent>
            <PinIcon src="/icons/pin.png" alt="pin" />
          </PinAndBoxWrapper>
        )}

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
    </FullScreenBackground>
  );
}

const FullScreenBackground = styled.div`
  position: relative;
  width: 100%;
  height: 100dvh;
  background-image: url('/icons/EXmap.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
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

const PinAndBoxWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  z-index: 10;
`;

const PinIcon = styled.img`
  width: 28px;
  height: 36px;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
`;

const BoxBackground = styled.img`
  width: 280px;
  height: auto;
  position: absolute;
  top: -100px;
  z-index: 1;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
`;

const BoxContent = styled.div`
  position: absolute;
  top: -100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 280px;
  padding: 16px;
  z-index: 2;
`;

const PlaceName = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #1C1C1C;
  text-align: center;
`;

const PlaceAddress = styled.div`
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.4;
`;
