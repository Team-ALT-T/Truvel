'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchPlaces } from '@/lib/hooks/useLocation';
import { GooglePlaceResult } from '@/lib/api/location';

interface LocationSearchInputProps {
  onSelect: (place: { name: string; address: string; latitude: number; longitude: number }) => void;
  selectedPlaces?: { name: string; address: string }[];
  onClear?: () => void; 
  onSearchStart?: () => void;
  searchCenter?: { lat: number; lng: number } | null;
}

interface SearchResult extends GooglePlaceResult {
  rating?: number;
  reviewCount?: number;
  category?: string;
  images: string[];
}

type SortType = 'none' | 'openNow' | 'rating' | 'reviewCount';

export default function LocationSearchInput({ onSelect, selectedPlaces = [], onClear, onSearchStart, searchCenter }: LocationSearchInputProps) {
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('none');
  
  // 디바운싱: 입력 후 500ms 대기
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(input.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [input]);

  // 실제 API 호출 (도시 좌표를 포함하여 검색)
  const { data: apiResults, isLoading, error } = useSearchPlaces(
    debouncedQuery, 
    searchCenter?.lat, 
    searchCenter?.lng, 
    debouncedQuery.length > 0
  );

  // 구글 API 키 (사진 URL 생성용)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 카테고리 타입을 한국어로 변환
  const translateTypes = (types?: string[] | null): string => {
    if (!types || types.length === 0) return "장소";
    
    const typeMap: { [key: string]: string } = {
      restaurant: "음식점",
      cafe: "카페",
      food: "음식점",
      lodging: "숙박",
      tourist_attraction: "관광명소",
      amusement_park: "테마파크",
      museum: "박물관",
      park: "공원",
      shopping_mall: "쇼핑몰",
      store: "상점",
      bar: "바",
      night_club: "나이트클럽",
      point_of_interest: "관심지점",
    };

    const translated = types
      .map(type => typeMap[type])
      .filter(Boolean);

    // 중복 제거
    const unique = [...new Set(translated)];
    
    // 최대 3개까지만
    return unique.length > 0 ? unique.slice(0, 3).join(", ") : "장소";
  };

  // API 결과를 UI 형식으로 변환
  useEffect(() => {
    if (apiResults && apiResults.length > 0) {
      const formattedResults: SearchResult[] = apiResults.map(result => {
        // 구글 사진 URL 생성
        const imageUrl = result.photoReference && apiKey
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${result.photoReference}&key=${apiKey}`
          : "/icons/blank.png";

        return {
          ...result,
          rating: result.rating || undefined,
          reviewCount: result.reviewCount || undefined,
          category: translateTypes(result.types),
          images: [imageUrl],
        };
      });
      setSearchResults(formattedResults);
    } else if (debouncedQuery.length > 0 && !isLoading) {
      setSearchResults([]);
    }
  }, [apiResults, debouncedQuery, isLoading, apiKey]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    if (value) {
      if (onSearchStart) onSearchStart();
      // 검색 중일 때는 현재 핀을 숨김
      if (onClear) onClear();
    } else {
      setSearchResults([]);
      setDebouncedQuery('');
      if (onClear) onClear();
    }
  };

  const handleClear = () => {
    setInput('');
    setSearchResults([]);
    setDebouncedQuery('');
    if (onClear) onClear();
  };

  const handleSelectPlace = (place: SearchResult) => {
    // 이미 선택된 장소인지 확인
    const isAlreadySelected = selectedPlaces.some(
      selected => selected.name === place.name && selected.address === place.address
    );
    
    if (!isAlreadySelected) {
      onSelect({
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
      });
    }
    
    setInput('');
    setSearchResults([]);
    setDebouncedQuery('');
  };

  // 정렬/필터 함수
  const getSortedResults = () => {
    if (!searchResults || searchResults.length === 0) return [];

    let sorted = [...searchResults];

    switch (sortType) {
      case 'openNow':
        // 영업 중인 것들을 위로
        sorted.sort((a, b) => {
          if (a.openNow === b.openNow) return 0;
          return a.openNow ? -1 : 1;
        });
        break;
      case 'rating':
        // 평점 높은 순
        sorted.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });
        break;
      case 'reviewCount':
        // 리뷰 많은 순
        sorted.sort((a, b) => {
          const countA = a.reviewCount || 0;
          const countB = b.reviewCount || 0;
          return countB - countA;
        });
        break;
      default:
        // 정렬 없음 (원래 순서)
        break;
    }

    return sorted;
  };

  const displayedResults = getSortedResults();

  return (
    <Container>
      <InputContainer>
        <StyledInput
          type="text"
          placeholder="장소 이름, 주소를 입력해주세요"
          value={input}
          onChange={handleInputChange}
        />
        {input && (
          <ClearButton onClick={handleClear}>✕</ClearButton>
        )}
        <SearchIcon src="/icons/Search_light.png" alt="검색" />
      </InputContainer>

      {/* 검색 결과 - 아래에서 올라오는 형태 */}
      {searchResults.length > 0 && (
        <SearchResultsOverlay>
        <DragHandle />
    
        <StickyBar>
          <FilterButtons>
            <FilterButton 
              $active={sortType === 'openNow'}
              onClick={() => setSortType(sortType === 'openNow' ? 'none' : 'openNow')}
            >
              지금 영업 중
            </FilterButton>
            <FilterButton 
              $active={sortType === 'rating'}
              onClick={() => setSortType(sortType === 'rating' ? 'none' : 'rating')}
            >
              최고 평점
            </FilterButton>
            <FilterButton 
              $active={sortType === 'reviewCount'}
              onClick={() => setSortType(sortType === 'reviewCount' ? 'none' : 'reviewCount')}
            >
              리뷰 수
            </FilterButton>
            <ClearFilterButton onClick={() => setSearchResults([])}>✕</ClearFilterButton>
          </FilterButtons>
        </StickyBar>
    
        <ResultsList>
        {displayedResults.map((result, index) => (
    <ResultItem key={index} onClick={() => handleSelectPlace(result)}>
      {/* 가로 스크롤 썸네일 */}
      <ResultImagesContainer>
        {result.images.map((image, i) => (
          <ResultImage key={i} src={image} alt={`${result.name} ${i + 1}`} />
        ))}
      </ResultImagesContainer>

      {/* 텍스트(좌) + 버튼(우) */}
      <InfoRow>
        <ResultContent>
          <ResultTitleRow>
            <ResultTitle>{result.name}</ResultTitle>
            <Dot>·</Dot>
            <ResultCategoryInline>{result.category}</ResultCategoryInline>
          </ResultTitleRow>

          <ResultRating>
            {result.rating} ({result.reviewCount?.toLocaleString() || 0})
            <StarIcon>⭐</StarIcon>
          </ResultRating>
          <ResultAddress>📍 {result.address}</ResultAddress>
        </ResultContent>

        <SelectButton type="button">선택</SelectButton>
      </InfoRow>
    </ResultItem>
  ))}
        </ResultsList>
        </SearchResultsOverlay>
      )}

      {/* 로딩 상태 */}
      {isLoading && debouncedQuery && (
        <LoadingContainer>
          <LoadingText>검색 중...</LoadingText>
        </LoadingContainer>
      )}

      {/* 에러 상태 */}
      {error && debouncedQuery && (
        <LoadingContainer>
          <LoadingText style={{ color: '#ef4444' }}>검색 결과를 불러올 수 없습니다.</LoadingText>
        </LoadingContainer>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 560px;   /* ✅ 시트와 같은 최대폭 */
  margin: 0 auto;     /* ✅ 중앙 정렬 */
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 12px 44px 12px 16px;
  font-size: 16px;
  border-radius: 12px;
  border: none;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  outline: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &::placeholder {
    color: #999;
  }
`;

const SearchIcon = styled.img`
  position: absolute;
  right: 16px;
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 44px;
  background: none;
  border: none;
  font-size: 16px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const SearchResultsOverlay = styled.div`
  position: fixed;
  inset: auto 0 0 0;
  background: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -6px 24px rgba(0,0,0,.12);
  z-index: 1000;
  max-height: 70vh;
  overflow-y: auto;
  animation: slideUpFromBottom .28s ease-out;

  width: 100%;
  max-width: 560px;    /* ✅ 넓혀도 과하게 안 퍼짐 */
  margin: 0 auto;
  padding: 0 12px 12px;
  padding-bottom: env(safe-area-inset-bottom, 12px);
`;

/* 상단 작은 핸들 */
const DragHandle = styled.div`
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: #e6e6e6;
  margin: 10px auto 6px;
`;

/* 필터 영역을 sticky로 고정 */
const StickyBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid #f0f0f0;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 4px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  @media (min-width: 768px) {
    gap: 12px;
    padding: 16px 8px;
  }
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 10px 14px;
  background: ${({ $active }) => $active ? '#3CA6FF' : '#f8f9fa'};
  border: 1px solid ${({ $active }) => $active ? '#3CA6FF' : '#e9ecef'};
  border-radius: 20px;
  font-size: 14px;
  color: ${({ $active }) => $active ? 'white' : '#495057'};
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) => $active ? '#3295e6' : '#e9ecef'};
  }

  @media (min-width: 768px) {
    padding: 12px 18px;
    font-size: 15px;
  }
`;

const ClearFilterButton = styled(FilterButton)`
  margin-left: auto;
`;

const ResultsList = styled.div`
  padding: 6px 0 20px;

  @media (min-width: 768px) {
    padding: 8px 4px 28px;
  }
`;

const ResultItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  @media (min-width: 768px) { padding: 20px 12px; gap: 14px; }
  &:last-child { border-bottom: none; }
  &:hover { background: #f8f9fa; border-radius: 12px; }
`;

const ResultImagesContainer = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  position: relative;

  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;

  &::after{
    content:'';
    position:absolute; right:0; top:0; bottom:0; width:28px;
    pointer-events:none;
    background: linear-gradient(to right, transparent, #fff);
  }
`;

const ResultImage = styled.img`
  /* ✅ 폭이 화면에 따라 살짝만 커지고, 최대/최소를 보장 */
  flex: 0 0 clamp(96px, 28vw, 120px);
  height: clamp(78px, 18vw, 96px);
  border-radius: 12px;
  object-fit: cover;
  background: #efefef;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
  scroll-snap-align: start;
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;   /* 버튼이 살짝 아래 */
  gap: 12px;
`;

const ResultContent = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ResultTitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
`;

const ResultTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #222;
  line-height: 1.25;
  @media (min-width: 768px) { font-size: 18px; }
`;

const Dot = styled.span`
  color: #777; transform: translateY(-1px);
`;

const ResultCategoryInline = styled.span`
  font-size: 13px;
  color: #777777;
`;

const ResultRating = styled.div`
  display: flex; align-items: center; gap: 6px;
  font-size: 14px; color: #333;
`;

const StarIcon = styled.span`
  font-size: 14px;
`;

const ResultAddress = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const SelectButton = styled.button`
  padding: 12px 18px;
  border-radius: 9999px;
  border: 1px solid #D6E9FF;
  background: #ffffff;
  color: #3CA6FF;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  height: fit-content;
  justify-self: end;
  margin-top: 6px;

  &:hover { background:#3CA6FF; color:#fff; border-color:#3CA6FF; }
  &:active{ transform: translateY(1px); }

  @media (max-width: 359px){
    grid-column: 1 / -1; width:100%; justify-self: stretch; margin-top: 8px;
  }
`;

const LoadingContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  text-align: center;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideUpFromBottom 0.3s ease-out;
  
  @keyframes slideUpFromBottom {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const LoadingText = styled.div`
  color: #666;
  font-size: 14px;
`;