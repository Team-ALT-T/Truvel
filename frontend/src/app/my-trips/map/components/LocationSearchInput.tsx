'use client';

import { useState } from 'react';
import styled from 'styled-components';

interface LocationSearchInputProps {
  onSelect: (place: { name: string; address: string }) => void;
  selectedPlaces?: { name: string; address: string }[];
  onClear?: () => void; 
  onSearchStart?: () => void;
}

interface SearchResult {
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  images: string[];
}

export default function LocationSearchInput({ onSelect, selectedPlaces = [], onClear, onSearchStart }: LocationSearchInputProps) {
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 검색 결과 시뮬레이션 (실제로는 API 호출)
  const mockSearchResults: SearchResult[] = [
    {
      name: "도쿄 디즈니씨",
      address: "일본 도쿄도 우라야스시",
      rating: 4.8,
      reviewCount: 1228,
      category: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
      images: ["/icons/blank.png", "/icons/blank.png", "/icons/blank.png", "/icons/blank.png", "/icons/blank.png"]
    },
    {
      name: "도쿄 디즈니랜드",
      address: "일본 도쿄도 우라야스시",
      rating: 4.7,
      reviewCount: 1156,
      category: "테마 (음식점, 관광명소, 쇼핑, 체험 등)",
      images: ["/icons/blank.png", "/icons/blank.png", "/icons/blank.png", "/icons/blank.png"]
    },
    {
      name: "도쿄 타워",
      address: "일본 도쿄도 미나토구",
      rating: 4.6,
      reviewCount: 892,
      category: "관광명소, 전망대",
      images: ["/icons/blank.png", "/icons/blank.png", "/icons/blank.png"]
    },
    {
      name: "시부야 스크램블 교차로",
      address: "일본 도쿄도 시부야구",
      rating: 4.5,
      reviewCount: 756,
      category: "관광명소, 도시경관",
      images: ["/icons/blank.png", "/icons/blank.png", "/icons/blank.png", "/icons/blank.png"]
    },
    {
      name: "하라주쿠",
      address: "일본 도쿄도 시부야구",
      rating: 4.4,
      reviewCount: 634,
      category: "쇼핑, 문화",
      images: ["/icons/blank.png", "/icons/blank.png", "/icons/blank.png"]
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    if (value) { // 빈 문자열이 아니면 무조건 검색 (숫자만 있어도 됨)
      if (onSearchStart) onSearchStart();
      handleSearch();
      // 검색 중일 때는 현재 핀을 숨김
      if (onClear) onClear();
    } else {
      setSearchResults([]);
      setIsSearching(false);
      if (onClear) onClear();
    }
  };

  const handleSearch = () => {
    const trimmed = input.trim();
    if (!trimmed) { // 빈 문자열이 아니면 무조건 검색
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    // 실제 검색 API 호출 대신 시뮬레이션
    setTimeout(() => {
      // 입력된 텍스트가 포함된 결과만 필터링 (숫자도 포함)
      const filteredResults = mockSearchResults.filter(result => 
        result.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        result.address.toLowerCase().includes(trimmed.toLowerCase()) ||
        result.category?.toLowerCase().includes(trimmed.toLowerCase()) ||
        result.rating?.toString().includes(trimmed) ||
        result.reviewCount?.toString().includes(trimmed)
      );
      setSearchResults(filteredResults);
      setIsSearching(false);
    }, 500);
  };

  const handleClear = () => {
    setInput('');
    setSearchResults([]);
    setIsSearching(false);
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
      });
    }
    
    setInput('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <Container>
      <InputContainer>
        <StyledInput
          type="text"
          placeholder="장소 이름, 주소를 입력해주세요"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        {input && (
          <ClearButton onClick={handleClear}>✕</ClearButton>
        )}
        <SearchIcon src="/icons/Search_light.png" alt="검색" onClick={handleSearch} />
      </InputContainer>

      {/* 검색 결과 - 아래에서 올라오는 형태 */}
      {searchResults.length > 0 && (
        <SearchResultsOverlay>
        <DragHandle />
    
        <StickyBar>
          <FilterButtons>
            <FilterButton>지금 영업 중</FilterButton>
            <FilterButton>최고 평점</FilterButton>
            <FilterButton>리뷰 수</FilterButton>
            <ClearFilterButton onClick={() => setSearchResults([])}>✕</ClearFilterButton>
          </FilterButtons>
        </StickyBar>
    
        <ResultsList>
        {searchResults.map((result, index) => (
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
          <ResultAddress>📍 장소의 상세 주소 입력칸</ResultAddress>
        </ResultContent>

        <SelectButton type="button">선택</SelectButton>
      </InfoRow>
    </ResultItem>
  ))}
        </ResultsList>
        </SearchResultsOverlay>
      )}

      {/* 로딩 상태 */}
      {isSearching && (
        <LoadingContainer>
          <LoadingText>검색 중...</LoadingText>
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

const FilterButton = styled.button`
  padding: 10px 14px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  font-size: 14px;
  color: #495057;
  white-space: nowrap;
  flex-shrink: 0;

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