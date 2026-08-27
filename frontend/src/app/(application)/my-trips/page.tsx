'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styled from 'styled-components'
import TripCard from './components/TripCard'
import { useTravelPlans } from '@/lib/hooks/useTravel'

// 타입 정의
interface Trip {
  title: string
  location: string
  date: string
  daysLeft?: string
  showPeople?: boolean
  peopleCount?: number
  travelPlanId?: number
}

interface HoverIconProps {
  path: string
  label: string
  off: string
  on: string
  active?: boolean
  onClick?: () => void
}

const MyTripsPage = () => {
  const router = useRouter()
  const { data: travelPlans, isLoading, error } = useTravelPlans()

  // SSR(서버)에서 렌더링된 값과 CSR(브라우저)에서 렌더링된 값이
  // 시간/타임존 차이로 달라지면 hydration 경고가 발생할 수 있습니다.
  // 아래 mounted 전에는 "오늘(today)" 기반 계산을 하지 않아 DOM 불일치를 막습니다.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 날짜 포맷팅 함수
  const parseDateOnlyToUTCms = (dateString: string): number => {
    // 'YYYY-MM-DD' 또는 ISO 문자열(앞 10자리)을 날짜 단위로만 파싱합니다.
    // 이렇게 해야 서버/브라우저 타임존 차이로 날짜가 하루 밀리는 문제를 줄일 수 있어요.
    const datePart = dateString.slice(0, 10)
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      const [, y, m, d] = match
      return Date.UTC(Number(y), Number(m) - 1, Number(d))
    }

    // 포맷을 보장할 수 없을 때만 fallback으로 Date를 사용합니다.
    const date = new Date(dateString)
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  }

  const formatDate = (dateString: string): string => {
    const datePart = dateString.slice(0, 10)
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      const [, y, m, d] = match
      return `${y}.${m}.${d}`
    }

    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}.${month}.${day}`
  }

  // 날짜 범위 포맷팅 함수
  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = formatDate(startDate)
    const end = formatDate(endDate)
    // 연도 포함하여 표시
    return `${start} - ${end}`
  }

  // 남은 일수 계산 함수
  const calculateDaysLeft = (endDate: string): string => {
    // hydration 전에는 "오늘" 기반 값이 서버/브라우저에서 달라질 수 있으므로 비웁니다.
    if (!mounted) return ''

    const now = new Date()
    const todayUTCms = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    const endUTCms = parseDateOnlyToUTCms(endDate)
    const diffDays = Math.ceil((endUTCms - todayUTCms) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return ''
    if (diffDays === 0) return '오늘 출발이에요!'
    return `${diffDays}일 남았어요!`
  }

  // 여행 데이터를 Trip 형식으로 변환
  const trips: Trip[] = useMemo(() => {
    if (!travelPlans) return []
    
    return travelPlans.map((plan) => ({
      title: `${plan.cityName} 여행`,
      location: `${plan.countryName}, ${plan.cityName}`,
      date: formatDateRange(plan.startDate, plan.endDate),
      daysLeft: calculateDaysLeft(plan.endDate),
      showPeople: true,
      peopleCount: 1, // TODO: 실제 참여자 수 연동 필요
      travelPlanId: plan.travelPlanId,
    }))
  }, [travelPlans, mounted])

  // 예정된 여행과 지난 여행 구분
  const { upcomingTrips, pastTrips } = useMemo(() => {
    // mounted 전에는 오늘 값이 서버/브라우저에서 달라질 수 있으니 고정합니다.
    const todayUTCms = mounted
      ? (() => {
          const now = new Date()
          return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
        })()
      : 0

    const upcoming: Trip[] = []
    const past: Trip[] = []

    trips.forEach((trip) => {
      if (!travelPlans) return
      
      const plan = travelPlans.find((p) => p.travelPlanId === trip.travelPlanId)
      if (!plan) return

      const endUTCms = parseDateOnlyToUTCms(plan.endDate)
      if (endUTCms >= todayUTCms) {
        upcoming.push(trip)
      } else {
        past.push(trip)
      }
    })

    return { upcomingTrips: upcoming, pastTrips: past }
  }, [trips, travelPlans, mounted])

  const handlePopularClick = () => {
    router.push('my-trips/popular')
  }

  // 오늘 날짜와 겹치는 여행 찾기
  const findTodayOverlappingTrip = (): number | null => {
    if (!travelPlans) return null

    if (!mounted) return null
    
    const now = new Date()
    const todayUTCms = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    
    // 오늘 날짜가 startDate와 endDate 사이에 있는 여행 찾기
    for (const plan of travelPlans) {
      const startUTCms = parseDateOnlyToUTCms(plan.startDate)
      const endUTCms = parseDateOnlyToUTCms(plan.endDate)
      
      if (todayUTCms >= startUTCms && todayUTCms <= endUTCms) {
        return plan.travelPlanId
      }
    }
    
    return null
  }

  const handleMapClick = () => {
    const overlappingTripId = findTodayOverlappingTrip()
    
    if (overlappingTripId) {
      // sessionStorage에 travelPlanId 저장
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentTravelPlanId', String(overlappingTripId))
      }
      router.push('/my-trips/map')
    } else {
      // 겹치는 여행이 없으면 일반 맵 페이지로 이동
      router.push('/map')
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Inner>
          <Header>내 여행</Header>
          <LoadingMessage>여행 일정을 불러오는 중...</LoadingMessage>
        </Inner>
      </PageContainer>
    )
  }

  if (error) {
    // 401 에러(인증 실패)인 경우 로그인 페이지로 리다이렉트
    const errorStatus = (error as any)?.response?.status;
    if (errorStatus === 401 || errorStatus === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return null;
    }

    return (
      <PageContainer>
        <Inner>
          <Header>내 여행</Header>
          <ErrorMessage>여행 일정을 불러오는데 실패했습니다.</ErrorMessage>
          <RegisterButton onClick={handlePopularClick} style={{ marginTop: '1rem' }}>
            여행 등록하기
          </RegisterButton>
        </Inner>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Inner>
        <Header>내 여행</Header>
        <RegisterButton onClick={handlePopularClick}>여행 등록하기</RegisterButton>

        <Section>
          <SectionTitle>예정된 여행</SectionTitle>
          {upcomingTrips.length > 0 ? (
            <TripList>
              {upcomingTrips.map((trip) => (
                <TripCard key={trip.travelPlanId} {...trip} />
              ))}
            </TripList>
          ) : (
            <EmptyMessage>예정된 여행이 없습니다.</EmptyMessage>
          )}
        </Section>

        <Section style={{ marginBottom: '6rem' }}>
          <SectionTitle>지난 여행</SectionTitle>
          {pastTrips.length > 0 ? (
            <TripList>
              {pastTrips.map((trip) => (
                <TripCard key={trip.travelPlanId} {...trip} />
              ))}
            </TripList>
          ) : (
            <EmptyMessage>지난 여행이 없습니다.</EmptyMessage>
          )}
        </Section>
      </Inner>

      <Footer>
        <HoverIconButton path="/home" label="홈" off="/icons/home-off.png" on="/icons/home-on.png" />
        <HoverIconButton path="/my-trips" label="내 여행" off="/icons/trip-on.png" on="/icons/trip-on.png" active />
        <HoverIconButton path="/my-trips/map" label="지도" off="/icons/map-off.png" on="/icons/map-on.png" onClick={handleMapClick} />
        <HoverIconButton path="/account" label="가계부" off="/icons/money-off.png" on="/icons/money-on.png" />
        <HoverIconButton path="/my" label="MY" off="/icons/my-off.png" on="/icons/my-on.png" />
      </Footer>
    </PageContainer>
  )
}

export default MyTripsPage

const IconButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  color: ${({ $active }) => ($active ? '#1C1C1C' : '#A0A0A0')};
  font-weight: ${({ $active }) => ($active ? '700' : '400')};
  transition: all 0.2s ease-in-out;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: #1C1C1C;
    font-weight: 600;
  }

  img {
    margin-bottom: 0.25rem;
  }
`

function HoverIconButton({ path, label, off, on, active = false, onClick }: HoverIconProps) {
  const router = useRouter()
  const [hover, setHover] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(path)
    }
  }

  return (
    <IconButton
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      $active={active}
    >
      <Image src={hover || active ? on : off} alt={label} width={20} height={20} />
      <span>{label}</span>
    </IconButton>
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
  max-width: 1024px;
  padding: 0 1rem;
`

const Header = styled.header`
  padding-top: 1rem;
  font-size: 1.25rem;
  color: #1C1C1C;
  font-weight: 600;
  margin-bottom: 0.75rem;
`

const RegisterButton = styled.button`
  width: 100%;
  background-color: #3CA6FF;
  color: #FFFFFF;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.75rem;
  transition: filter 0.2s;
  &:hover {
    filter: brightness(1.05);
  }
`

const Section = styled.section`
  margin-top: 1.5rem;
`

const SectionTitle = styled.h2`
  font-size: 0.875rem;
  color: #777777;
  font-weight: 600;
  margin-bottom: 0.75rem;
`

const TripList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 4rem;
  font-size: 0.75rem;
  z-index: 20;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.05);
`

const LoadingMessage = styled.p`
  text-align: center;
  color: #777777;
  margin-top: 2rem;
`

const ErrorMessage = styled.p`
  text-align: center;
  color: #ef4444;
  margin-top: 2rem;
`

const EmptyMessage = styled.p`
  text-align: center;
  color: #777777;
  font-size: 0.875rem;
  padding: 2rem 0;
`
