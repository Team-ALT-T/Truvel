"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import type {
  CitySearchResponse,
  CountrySearchResponse,
} from "@/lib/api/search";
import { publicLocationQueries } from "@/lib/queries/publicLocationQueries";
import CitySelectionList from "./components/CitySelectionList";
import SelectedCitiesAction from "./components/SelectedCitiesAction";
import type { SelectableCity } from "./types";
import { useSelectedCitiesDraft } from "./useSelectedCitiesDraft";

type CountrySection = {
  id: string; // countryId를 문자열로 변환
  countryId: number; // 실제 countryId
  country: string;
  cities: SelectableCity[];
};

const TAB_OPTIONS = ["해외 여행지", "국내 여행지"] as const;
type TabKey = (typeof TAB_OPTIONS)[number];
const POPULAR_CITY_NAMES = [
  "도쿄",
  "오사카",
  "파리",
  "바르셀로나",
  "발리",
  "제주",
];

type PopularTripsClientProps = {
  initialCountries: CountrySearchResponse[];
  initialCities: CitySearchResponse[];
};

export default function PopularTripsClient({
  initialCountries,
  initialCities,
}: PopularTripsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("해외 여행지");
  const [query, setQuery] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null,
  ); // 선택된 국가 ID
  const {
    selectedCities,
    selectedCityIds,
    toggleCity,
    clearSelected,
    persistDraft,
    prepareSchedule,
  } = useSelectedCitiesDraft();

  const handleSearch = () => {
    const keyword = query.trim();
    if (!keyword) return;

    persistDraft();
    const params = new URLSearchParams({ keyword });
    if (selectedCountryId !== null) {
      params.set("countryId", String(selectedCountryId));
    }
    router.push(`/my-trips/popular/search?${params.toString()}`);
  };

  const countries = initialCountries;

  // 해외/국내 구분을 위한 국가 필터링
  const filteredCountries = useMemo(() => {
    if (activeTab === "해외 여행지") {
      // 대한민국 제외
      return countries.filter((c) => c.koreanName !== "대한민국");
    } else {
      // 대한민국만
      return countries.filter((c) => c.koreanName === "대한민국");
    }
  }, [countries, activeTab]);

  // 대한민국 countryId 찾기 (국내 여행지 탭용)
  const koreaCountryId = useMemo(() => {
    const korea = countries.find((c) => c.koreanName === "대한민국");
    return korea?.countryId || null;
  }, [countries]);

  // 도시 조회용 countryId 결정: 선택된 국가가 있으면 그것을, 없으면 탭에 따라 적절한 값 사용
  const cityCountryId = useMemo(() => {
    // 선택된 국가가 있으면 그것을 사용
    if (selectedCountryId !== null) {
      return selectedCountryId;
    }
    // 선택된 국가가 없고 국내 여행지 탭이면 대한민국만
    if (activeTab === "국내 여행지" && koreaCountryId) {
      return koreaCountryId;
    }
    // 해외 여행지 탭이면 undefined (모든 도시 가져온 후 필터링)
    return undefined;
  }, [selectedCountryId, activeTab, koreaCountryId]);

  // 최초 화면은 ISR props를 쓰고, 국가를 고른 뒤에만 공개 API를 조회한다.
  const {
    data: countryCities,
    isLoading: countryCitiesLoading,
    isError: countryCitiesError,
  } = useQuery({
    ...publicLocationQueries.cities(cityCountryId),
    enabled: cityCountryId !== undefined,
  });

  const allCities = cityCountryId !== undefined ? countryCities : initialCities;

  // 국가별로 그룹화된 섹션 생성
  const sections = useMemo<CountrySection[]>(() => {
    if (!allCities) return [];

    // API에서 이미 검색어로 필터링된 결과를 받으므로 추가 필터링 불필요
    const citiesToUse = allCities;

    // 국가별로 그룹화
    const countryMap = new Map<
      number,
      { countryId: number; countryName: string; cities: CitySearchResponse[] }
    >();

    citiesToUse.forEach((city) => {
      const country = countries.find((c) => c.countryId === city.countryId);
      if (!country) return;

      // 해외/국내 필터링
      const isDomestic = country.koreanName === "대한민국";
      if (activeTab === "해외 여행지" && isDomestic) return;
      if (activeTab === "국내 여행지" && !isDomestic) return;

      // 선택된 국가가 있으면 해당 국가의 도시만 포함
      if (selectedCountryId !== null && city.countryId !== selectedCountryId)
        return;

      if (!countryMap.has(city.countryId)) {
        countryMap.set(city.countryId, {
          countryId: city.countryId,
          countryName: country.koreanName,
          cities: [],
        });
      }
      countryMap.get(city.countryId)!.cities.push(city);
    });

    // CountrySection 형식으로 변환
    return Array.from(countryMap.values())
      .sort((a, b) => a.countryId - b.countryId) // countryId 순서로 정렬
      .map((countryData) => ({
        id: String(countryData.countryId),
        countryId: countryData.countryId,
        country: countryData.countryName,
        cities: countryData.cities
          .filter((city) => city.korean) // korean이 없는 도시 제외
          .sort((a, b) => a.korean.localeCompare(b.korean)) // 도시명 정렬
          .map((city) => ({
            cityId: city.cityId,
            countryId: city.countryId,
            name: city.korean,
            image: "/icons/blank.png",
          })),
      }));
  }, [countries, allCities, activeTab, selectedCountryId]);

  // 인기 여행지 (검색어와 관계없이 항상 표시)
  const popularSpots = useMemo<SelectableCity[]>(() => {
    // 인기 도시명에 해당하는 도시들을 찾아서 반환
    const popularCities = initialCities
      .filter((city) => POPULAR_CITY_NAMES.includes(city.korean))
      .slice(0, 6)
      .map((city) => ({
        cityId: city.cityId,
        countryId: city.countryId,
        name: city.korean,
        image: "/icons/blank.png",
      }));

    // 인기 도시명 순서대로 정렬
    return popularCities.sort((a, b) => {
      const indexA = POPULAR_CITY_NAMES.indexOf(a.name);
      const indexB = POPULAR_CITY_NAMES.indexOf(b.name);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [initialCities]);

  const isLoading = countryCitiesLoading;

  if (isLoading) {
    return (
      <PageContainer>
        <Inner>
          <LoadingMessage>여행지를 불러오는 중...</LoadingMessage>
        </Inner>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Inner>
        <HeaderRow>
          <BackButton onClick={() => router.back()}>
            <Image src="/icons/Larrow.png" alt="뒤로" width={20} height={20} />
          </BackButton>
          <SearchBox>
            <SearchIcon
              src="/icons/Search_light.png"
              alt="검색"
              width={18}
              height={18}
              onClick={handleSearch}
              style={{ cursor: "pointer" }}
            />
            <SearchInput
              placeholder="어디로 떠나시나요?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // 엔터 키를 누르면 즉시 검색 실행
                  handleSearch();
                }
              }}
            />
          </SearchBox>
        </HeaderRow>

        <PopularRow>
          {popularSpots.map((spot) => (
            <PopularItem key={spot.cityId} onClick={() => toggleCity(spot)}>
              <PopularThumb>
                <Image
                  src={spot.image || "/icons/blank.png"}
                  alt={spot.name}
                  fill
                  sizes="64px"
                />
              </PopularThumb>
              <PopularName>{spot.name}</PopularName>
            </PopularItem>
          ))}
        </PopularRow>

        <Tabs>
          {TAB_OPTIONS.map((tab) => (
            <TabButton
              key={tab}
              $active={activeTab === tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedCountryId(null); // 탭 변경 시 선택된 국가 초기화
                setQuery(""); // 검색어도 초기화
              }}
            >
              {tab}
            </TabButton>
          ))}
        </Tabs>

        <CategoryChips>
          <Chip
            $active={selectedCountryId === null}
            onClick={() => {
              setQuery("");
              setSelectedCountryId(null);
            }}
          >
            전체
          </Chip>
          {filteredCountries?.map((country) => (
            <Chip
              key={country.countryId}
              $active={selectedCountryId === country.countryId}
              onClick={() => {
                setQuery("");
                setSelectedCountryId(country.countryId);
              }}
            >
              {country.koreanName}
            </Chip>
          ))}
        </CategoryChips>

        <Sections>
          {countryCitiesError ? (
            <EmptyMessage>
              도시 목록을 불러오지 못했습니다. 다시 시도해주세요.
            </EmptyMessage>
          ) : !isLoading && sections.length > 0 ? (
            sections.map((sec) => (
              <Section key={sec.id}>
                <SectionTitle>{sec.country}</SectionTitle>
                <CitySelectionList
                  cities={sec.cities}
                  selectedCityIds={selectedCityIds}
                  onSelect={toggleCity}
                />
              </Section>
            ))
          ) : !isLoading ? (
            <EmptyMessage>검색 결과가 없습니다.</EmptyMessage>
          ) : null}
        </Sections>

        <SelectedCitiesAction
          cities={selectedCities}
          onToggle={toggleCity}
          onClear={clearSelected}
          onComplete={() => {
            prepareSchedule();
            router.push("/schedule");
          }}
        />
      </Inner>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  background-color: #faf8f6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
`;

const Inner = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 0 1rem 2rem;
`;

const HeaderRow = styled.div`
  padding-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 999px;
  padding: 0.625rem 0.875rem;
`;

const SearchIcon = styled(Image)``;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
  background: transparent;
  color: #777777;
  ::placeholder {
    color: #b0b0b0;
  }
`;

const PopularRow = styled.div`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 1rem 0.25rem 0.25rem;
`;

const PopularItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 0.5;
  }
`;

const PopularThumb = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #eaeaea;
  margin-bottom: 0.375rem;
`;

const PopularName = styled.span`
  font-size: 11px;
  color: #1c1c1c;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 0.75rem 0 0.5rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.625rem 0.5rem;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? "#3CA6FF" : "#e6e6e6")};
  background: ${({ $active }) => ($active ? "#3CA6FF" : "#f8f8f8")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#1c1c1c")};
  font-weight: 600;
`;

const CategoryChips = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.25rem 0;
`;

const Chip = styled.button<{ $active?: boolean }>`
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? "#1c1c1c" : "#e6e6e6")};
  background: ${({ $active }) => ($active ? "#1c1c1c" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#6f6f6f")};
  font-size: 12px;
  white-space: nowrap;
`;

const Sections = styled.div`
  margin-top: 0.2rem;
`;

const Section = styled.section`
  padding: 0.75rem 0;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 700;
  color: #1c1c1c;
  margin-bottom: 0.5rem;
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: #777777;
  margin-top: 4rem;
  font-size: 0.875rem;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #777777;
  padding: 3rem 0;
  font-size: 0.875rem;
`;
