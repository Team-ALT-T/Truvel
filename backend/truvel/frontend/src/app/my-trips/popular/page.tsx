'use client'

import React, { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { useCountries, useCities } from '@/lib/hooks/useSearch'
import { CitySearchResponse } from '@/lib/api/search'

type City = {
  id: string // cityId를 문자열로 변환
  cityId: number // 실제 cityId
  countryId: number
  name: string
  subtitle?: string
  image?: string
}

type CountrySection = {
  id: string // countryId를 문자열로 변환
  countryId: number // 실제 countryId
  country: string
  cities: City[]
}

// 인기 여행지 도시 ID 리스트 (실제 인기 여행지 기준으로 설정)
// 도쿄, 오사카, 파리, 바르셀로나, 발리, 제주 등의 cityId
// CountriesAndCities.json 기준으로 설정 (실제 DB의 cityId와 매칭 필요)
const POPULAR_CITY_IDS: number[] = [
  // 일본 도시들 (countryId: 1)
  // 도쿄, 오사카 등 - 실제 cityId는 DB에서 확인 필요
  // 일단 도시명으로 검색하여 cityId를 찾는 방식 사용
]

const TAB_OPTIONS = ['해외 여행지', '국내 여행지'] as const
type TabKey = typeof TAB_OPTIONS[number]

export default function PopularTripsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('해외 여행지')
  const [query, setQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('') // 실제 검색에 사용되는 쿼리 (엔터 키 또는 검색 아이콘 클릭 시)
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null) // 선택된 국가 ID
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]) // cityId를 문자열로 저장

  // 검색 실행 함수
  const handleSearch = () => {
    setSearchQuery(query.trim())
    if (query.trim()) {
      setSelectedCountryId(null)
    } else {
      // 검색어가 비어있으면 전체 목록 표시
      setSelectedCountryId(null)
    }
  }

  // 국가 목록 조회 (검색어는 도시 검색에만 사용하고, 국가 목록은 항상 전체 조회)
  const { data: countries, isLoading: countriesLoading } = useCountries(undefined)
  
  // 해외/국내 구분을 위한 국가 필터링
  const filteredCountries = useMemo(() => {
    if (!countries) return []
    
    if (activeTab === '해외 여행지') {
      // 대한민국 제외
      return countries.filter(c => c.koreanName !== '대한민국')
    } else {
      // 대한민국만
      return countries.filter(c => c.koreanName === '대한민국')
    }
  }, [countries, activeTab])

  // 대한민국 countryId 찾기 (국내 여행지 탭용)
  const koreaCountryId = useMemo(() => {
    if (!countries) return null
    const korea = countries.find(c => c.koreanName === '대한민국')
    return korea?.countryId || null
  }, [countries])

  // 도시 조회용 countryId 결정: 선택된 국가가 있으면 그것을, 없으면 탭에 따라 적절한 값 사용
  const cityCountryId = useMemo(() => {
    // 선택된 국가가 있으면 그것을 사용
    if (selectedCountryId !== null) {
      return selectedCountryId
    }
    // 선택된 국가가 없고 국내 여행지 탭이면 대한민국만
    if (activeTab === '국내 여행지' && koreaCountryId) {
      return koreaCountryId
    }
    // 해외 여행지 탭이면 undefined (모든 도시 가져온 후 필터링)
    return undefined
  }, [selectedCountryId, activeTab, koreaCountryId])

  // 도시 목록 조회 (검색어를 API에 전달)
  const { data: allCities, isLoading: citiesLoading } = useCities(
    cityCountryId || undefined, // 탭에 따라 적절한 countryId 전달
    searchQuery.trim() || undefined // 검색어가 있으면 API에 전달
  )

  // 인기 여행지용 도시 목록 조회 (검색어 없이 항상 전체 조회)
  const { data: allCitiesForPopular, isLoading: popularCitiesLoading } = useCities(
    undefined, // 모든 국가
    undefined // 검색어 없음
  )

  // 국가별로 그룹화된 섹션 생성
  const sections = useMemo<CountrySection[]>(() => {
    if (!countries || !allCities) return []

    // API에서 이미 검색어로 필터링된 결과를 받으므로 추가 필터링 불필요
    const citiesToUse = allCities

    // 국가별로 그룹화
    const countryMap = new Map<number, { countryId: number; countryName: string; cities: CitySearchResponse[] }>()
    
    citiesToUse.forEach(city => {
      const country = countries.find(c => c.countryId === city.countryId)
      if (!country) return

      // 해외/국내 필터링
      const isDomestic = country.koreanName === '대한민국'
      if (activeTab === '해외 여행지' && isDomestic) return
      if (activeTab === '국내 여행지' && !isDomestic) return

      // 선택된 국가가 있으면 해당 국가의 도시만 포함
      if (selectedCountryId !== null && city.countryId !== selectedCountryId) return

      if (!countryMap.has(city.countryId)) {
        countryMap.set(city.countryId, {
          countryId: city.countryId,
          countryName: country.koreanName,
          cities: []
        })
      }
      countryMap.get(city.countryId)!.cities.push(city)
    })

    // CountrySection 형식으로 변환
    return Array.from(countryMap.values())
      .sort((a, b) => a.countryName.localeCompare(b.countryName)) // 국가명 정렬
      .map(countryData => ({
        id: String(countryData.countryId),
        countryId: countryData.countryId,
        country: countryData.countryName,
        cities: countryData.cities
          .sort((a, b) => a.koreanName.localeCompare(b.koreanName)) // 도시명 정렬
          .map(city => ({
            id: String(city.cityId),
            cityId: city.cityId,
            countryId: city.countryId,
            name: city.koreanName,
            image: '/icons/blank.png',
          }))
      }))
  }, [countries, allCities, activeTab, selectedCountryId, searchQuery])

  // 인기 여행지 도시명 리스트 (API에서 가져온 도시 중에서 필터링)
  const POPULAR_CITY_NAMES = ['도쿄', '오사카', '파리', '바르셀로나', '발리', '제주']
  
  // 인기 여행지 (검색어와 관계없이 항상 표시)
  const popularSpots = useMemo<City[]>(() => {
    if (!allCitiesForPopular) return []
    
    // 인기 도시명에 해당하는 도시들을 찾아서 반환
    const popularCities = allCitiesForPopular
      .filter(city => POPULAR_CITY_NAMES.includes(city.koreanName))
      .slice(0, 6)
      .map(city => ({
        id: String(city.cityId),
        cityId: city.cityId,
        countryId: city.countryId,
        name: city.koreanName,
        image: '/icons/blank.png',
      }))
    
    // 인기 도시명 순서대로 정렬
    return popularCities.sort((a, b) => {
      const indexA = POPULAR_CITY_NAMES.indexOf(a.name)
      const indexB = POPULAR_CITY_NAMES.indexOf(b.name)
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })
  }, [allCitiesForPopular])

  const onSelectCity = (city: City) => {
    setSelectedCityIds((prev) => {
      const exists = prev.includes(city.id)
      if (exists) return prev.filter((id) => id !== city.id)
      return [...prev, city.id]
    })
  }

  const clearSelected = () => setSelectedCityIds([])

  const selectedCities = useMemo(() => {
    if (!allCities) return []
    
    const cityMap = new Map<string, City>()
    sections.forEach((sec) => {
      sec.cities.forEach((c) => cityMap.set(c.id, c))
    })
    
    return selectedCityIds
      .map((id) => cityMap.get(id))
      .filter(Boolean) as City[]
  }, [selectedCityIds, sections, allCities])

  const isLoading = countriesLoading || citiesLoading || popularCitiesLoading

  if (isLoading) {
    return (
      <PageContainer>
        <Inner>
          <LoadingMessage>여행지를 불러오는 중...</LoadingMessage>
        </Inner>
      </PageContainer>
    )
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
              style={{ cursor: 'pointer' }}
            />
            <SearchInput
              placeholder="어디로 떠나시나요?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // 엔터 키를 누르면 즉시 검색 실행
                  handleSearch()
                }
              }}
            />
          </SearchBox>
        </HeaderRow>

        <PopularRow>
          {popularSpots.map((spot) => (
            <PopularItem 
              key={spot.id}
              onClick={() => onSelectCity(spot)}
            >
              <PopularThumb>
                <Image src={spot.image || '/icons/blank.png'} alt={spot.name} fill sizes="64px" />
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
                setActiveTab(tab)
                setSelectedCountryId(null) // 탭 변경 시 선택된 국가 초기화
                setQuery('') // 검색어도 초기화
                setSearchQuery('') // 검색 쿼리도 초기화
              }}
            >
              {tab}
            </TabButton>
          ))}
        </Tabs>

        <CategoryChips>
          <Chip 
            $active={selectedCountryId === null && !searchQuery} 
            onClick={() => {
              setQuery('')
              setSearchQuery('')
              setSelectedCountryId(null)
            }}
          >
            전체
          </Chip>
          {filteredCountries?.map((country) => (
            <Chip 
              key={country.countryId} 
              $active={selectedCountryId === country.countryId} 
              onClick={() => {
                setQuery('')
                setSearchQuery('')
                setSelectedCountryId(country.countryId)
              }}
            >
              {country.koreanName}
            </Chip>
          ))}
        </CategoryChips>

        <Sections>
          {!isLoading && sections.length > 0 ? (
            sections.map((sec) => (
              <Section key={sec.id}>
                <SectionTitle>{sec.country}</SectionTitle>
                <CityList>
                  {sec.cities.map((city) => (
                    <CityRow key={city.id}>
                      <CityMeta>
                        <CityThumb>
                          <Image src={city.image || '/icons/blank.png'} alt={city.name} fill sizes="48px" />
                        </CityThumb>
                        <CityText>
                          <CityName>{city.name}</CityName>
                          {city.subtitle && <CitySub>{city.subtitle}</CitySub>}
                        </CityText>
                      </CityMeta>
                      <SelectButton
                        onClick={() => onSelectCity(city)}
                        $active={selectedCityIds.includes(city.id)}
                      >
                        선택
                      </SelectButton>
                    </CityRow>
                  ))}
                </CityList>
              </Section>
            ))
          ) : !isLoading ? (
            <EmptyMessage>검색 결과가 없습니다.</EmptyMessage>
          ) : null}
        </Sections>

        {selectedCityIds.length > 0 && (
          <BottomActionSection>
            <SelectedPlacesList>
              {selectedCities.map((city) => (
                <SelectedPlaceItem key={city.id}>
                  <PlaceThumbnail src="/icons/blank.png" alt={city.name} />
                  <PlaceLabel>{city.name}</PlaceLabel>
                  <RemoveButton onClick={() => onSelectCity(city)}>✕</RemoveButton>
                </SelectedPlaceItem>
              ))}
              <EditButton onClick={clearSelected}>편집</EditButton>
            </SelectedPlacesList>
            <AddButton 
              onClick={() => {
                // 선택한 도시 정보를 localStorage에 저장하거나 쿼리 파라미터로 전달
                const selectedCityData = selectedCities.map(city => ({
                  cityId: city.cityId,
                  countryId: city.countryId,
                  name: city.name,
                }))
                
                // schedule 페이지로 이동 (나중에 연동 시 사용)
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('selectedCities', JSON.stringify(selectedCityData))
                }
                router.push('/schedule')
              }}
            >
              선택 완료
            </AddButton>
          </BottomActionSection>
        )}
      </Inner>
    </PageContainer>
  )
}

const PageContainer = styled.div`
  background-color: #FAF8F6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
`

const Inner = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 0 1rem 2rem;
`

const HeaderRow = styled.div`
  padding-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 999px;
  padding: 0.625rem 0.875rem;
`

const SearchIcon = styled(Image)``

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
  background: transparent;
  color: #777777;
  ::placeholder { color: #b0b0b0; }
`

const PopularRow = styled.div`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 1rem 0.25rem 0.25rem;
`

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
`

const PopularThumb = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #eaeaea;
  margin-bottom: 0.375rem;
`

const PopularName = styled.span`
  font-size: 11px;
  color: #1c1c1c;
`

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 0.75rem 0 0.5rem;
`

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.625rem 0.5rem;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? '#3CA6FF' : '#e6e6e6')};
  background: ${({ $active }) => ($active ? '#3CA6FF' : '#f8f8f8')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#1c1c1c')};
  font-weight: 600;
`

const CategoryChips = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.25rem 0;
`

const Chip = styled.button<{ $active?: boolean }>`
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? '#1c1c1c' : '#e6e6e6')};
  background: ${({ $active }) => ($active ? '#1c1c1c' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#6f6f6f')};
  font-size: 12px;
  white-space: nowrap;
`

const Sections = styled.div`
  margin-top: 0.2rem;
`

const Section = styled.section`
  padding: 0.75rem 0;
`

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 700;
  color: #1C1C1C;
  margin-bottom: 0.5rem;
`

const CityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const CityRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.25rem;
`

const CityMeta = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`

const CityThumb = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #eaeaea;
`

const CityText = styled.div`
  display: flex;
  flex-direction: column;
`

const CityName = styled.div`
  font-size: 14px;
  color: #1c1c1c;
  font-weight: 700;
`

const CitySub = styled.div`
  font-size: 12px;
  color: #8b8b8b;
`

const SelectButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 30px;
  background: ${({ $active }) => ($active ? '#E8F1FF' : '#f4f6f8')};
  color: #1c1c1c;
  border: 1px solid ${({ $active }) => ($active ? '#3CA6FF' : '#e6e6e6')};
  font-weight: 700;
  font-size: 12px;
  min-width: 64px;
`

const BottomActionSection = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #e9ecef;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -6px 24px rgba(0,0,0,0.08);
`

const SelectedPlacesList = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 11px;
  margin-bottom: 11px;
`

const SelectedPlaceItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  flex-shrink: 0;
  padding-top: 5px;
`

const PlaceThumbnail = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const PlaceLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-align: center;
  white-space: nowrap;
`

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

  &:hover { background: #3295e6; }
  &:active { background: #2884cc; }
`

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
`

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
`

const LoadingMessage = styled.p`
  text-align: center;
  color: #777777;
  margin-top: 4rem;
  font-size: 0.875rem;
`

const EmptyMessage = styled.p`
  text-align: center;
  color: #777777;
  padding: 3rem 0;
  font-size: 0.875rem;
`


