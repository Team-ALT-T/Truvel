'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'

type City = {
  id: string
  name: string
  subtitle?: string
  image?: string
}

type CountrySection = {
  id: string
  country: string
  cities: City[]
}

const POPULAR_SPOTS: City[] = [
  { id: 'tokyo', name: '도쿄', image: '/icons/plane-icon.png' },
  { id: 'osaka', name: '오사카', image: '/icons/plane-icon.png' },
  { id: 'paris', name: '파리', image: '/icons/plane-icon.png' },
  { id: 'barcelona', name: '바르셀로나', image: '/icons/plane-icon.png' },
  { id: 'bali', name: '발리', image: '/icons/plane-icon.png' },
  { id: 'jeju', name: '제주', image: '/icons/plane-icon.png' },
]

const OVERSEAS: CountrySection[] = [
  {
    id: 'jp',
    country: '일본',
    cities: [
      { id: 'tokyo', name: '도쿄', subtitle: '하코네, 요코하마, 가마쿠라' },
      { id: 'fukuoka', name: '후쿠오카', subtitle: '유후인, 벳푸, 기타큐슈' },
      { id: 'osaka', name: '오사카', subtitle: '교토, 고베, 나라' },
      { id: 'kagoshima', name: '가고시마', subtitle: '이부스키, 기리시마, 야쿠시마' },
      { id: 'shizuoka', name: '시즈오카', subtitle: '후지노미야, 이토, 하마마쓰' },
      { id: 'nagoya', name: '나고야', subtitle: '다카야마, 시라카와고, 게로' },
      { id: 'sapporo', name: '삿포로', subtitle: '하코다테, 오타루, 비에이, 노보리베츠' },
      { id: 'okinawa', name: '오키나와' },
    ],
  },
  {
    id: 'sea',
    country: '동남아시아',
    cities: [
      { id: 'danang', name: '다낭', subtitle: '호이안, 후에' },
      { id: 'bangkok', name: '방콕' },
      { id: 'bali', name: '발리' },
      { id: 'singapore', name: '싱가포르' },
    ],
  },
]

const DOMESTIC: CountrySection[] = [
  {
    id: 'kr',
    country: '대한민국',
    cities: [
      { id: 'seoul', name: '서울' },
      { id: 'jeju', name: '제주' },
      { id: 'busan', name: '부산' },
      { id: 'gangneung', name: '강릉' },
    ],
  },
]

const TAB_OPTIONS = ['해외 여행지', '국내 여행지'] as const
type TabKey = typeof TAB_OPTIONS[number]

export default function PopularTripsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('해외 여행지')
  const [query, setQuery] = useState('')
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([])

  const sections = useMemo<CountrySection[]>(() => {
    const base = activeTab === '해외 여행지' ? OVERSEAS : DOMESTIC
    if (!query.trim()) return base
    const q = query.trim().toLowerCase()
    return base
      .map((sec) => ({
        ...sec,
        cities: sec.cities.filter((c) => c.name.toLowerCase().includes(q)),
      }))
      .filter((sec) => sec.cities.length > 0)
  }, [activeTab, query])

  const onSelectCity = (city: City) => {
    setSelectedCityIds((prev) => {
      const exists = prev.includes(city.id)
      if (exists) return prev.filter((id) => id !== city.id)
      return [...prev, city.id]
    })
  }

  const clearSelected = () => setSelectedCityIds([])

  const selectedCities = useMemo(() => {
    const dict = new Map<string, City>()
    ;[...OVERSEAS, ...DOMESTIC].forEach((sec) => {
      sec.cities.forEach((c) => dict.set(c.id, c))
    })
    return selectedCityIds.map((id) => dict.get(id)).filter(Boolean) as City[]
  }, [selectedCityIds])

  return (
    <PageContainer>
      <Inner>
        <HeaderRow>
          <BackButton onClick={() => router.back()}>
            <Image src="/icons/Larrow.png" alt="뒤로" width={20} height={20} />
          </BackButton>
          <SearchBox>
            <SearchIcon src="/icons/Search_light.png" alt="검색" width={18} height={18} />
            <SearchInput
              placeholder="어디로 떠나시나요?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </SearchBox>
        </HeaderRow>

        <PopularRow>
          {POPULAR_SPOTS.map((spot) => (
            <PopularItem key={spot.id}>
              <PopularThumb>
                <Image src="/icons/blank.png" alt={spot.name} fill sizes="64px" />
              </PopularThumb>
              <PopularName>{spot.name}</PopularName>
            </PopularItem>
          ))}
        </PopularRow>

        <Tabs>
          {TAB_OPTIONS.map((tab) => (
            <TabButton key={tab} $active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </TabButton>
          ))}
        </Tabs>

        <CategoryChips>
          <Chip $active={!query} onClick={() => setQuery('')}>전체</Chip>
          <Chip $active={query === '일본'} onClick={() => setQuery('일본')}>일본</Chip>
          <Chip $active={query === '동남아시아'} onClick={() => setQuery('동남아시아')}>동남아시아</Chip>
          <Chip $active={query === '유럽'} onClick={() => setQuery('유럽')}>유럽</Chip>
          <Chip $active={query === '국내'} onClick={() => setQuery('국내')}>국내</Chip>
        </CategoryChips>

        <Sections>
          {sections.map((sec) => (
            <Section key={sec.id}>
              <SectionTitle>{sec.country}</SectionTitle>
              <CityList>
                {sec.cities.map((city) => (
                  <CityRow key={city.id}>
                    <CityMeta>
                      <CityThumb>
                        <Image src="/icons/blank.png" alt={city.name} fill sizes="48px" />
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
          ))}
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
            <AddButton onClick={() => router.push('/schedule')}>선택 완료</AddButton>
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


