'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styled from 'styled-components'
import TripCard from './components/TripCard'

// 타입 정의
interface Trip {
  title: string
  location: string
  date: string
  daysLeft?: string
  showPeople?: boolean
  peopleCount?: number
}

interface HoverIconProps {
  path: string
  label: string
  off: string
  on: string
  active?: boolean
}

const MyTripsPage = () => {
  const router = useRouter()
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([])
  const [pastTrips, setPastTrips] = useState<Trip[]>([])

  useEffect(() => {
    const data = {
      upcoming: [
        {
          title: '샌프란시스코 여행',
          location: '미국, 샌프란시스코',
          date: '2025.05.12 - 05.16',
          daysLeft: '00일 남았어요!',
          showPeople: true,
          peopleCount: 3,
        },
        {
          title: '도쿄 여행',
          location: '일본, 도쿄',
          date: '2025.07.12 - 07.14',
          daysLeft: '00일 남았어요!',
          showPeople: true,
          peopleCount: 1,
        },
      ],
      past: [
        {
          title: '샌프란시스코 여행',
          location: '미국, 샌프란시스코',
          date: '2024.05.12 - 05.16',
          showPeople: true,
          peopleCount: 3,
        },
      ],
    }
    setUpcomingTrips(data.upcoming)
    setPastTrips(data.past)
  }, [])

  const handleRegisterClick = () => {
    router.push('/register')
  }

  return (
    <PageContainer>
      <Inner>
        <Header>내 여행</Header>
        <RegisterButton onClick={handleRegisterClick}>여행 등록하기</RegisterButton>

        <Section>
          <SectionTitle>예정된 여행</SectionTitle>
          <TripList>
            {upcomingTrips.map((trip, i) => (
              <TripCard key={i} {...trip} />
            ))}
          </TripList>
        </Section>

        <Section style={{ marginBottom: '6rem' }}>
          <SectionTitle>지난 여행</SectionTitle>
          <TripList>
            {pastTrips.map((trip, i) => (
              <TripCard key={i} {...trip} />
            ))}
          </TripList>
        </Section>
      </Inner>

      <Footer>
        <HoverIconButton path="/home" label="홈" off="/icons/home-off.png" on="/icons/home-on.png" />
        <HoverIconButton path="/my-trips" label="내 여행" off="/icons/trip-on.png" on="/icons/trip-on.png" active />
        <HoverIconButton path="/map" label="지도" off="/icons/map-off.png" on="/icons/map-on.png" />
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

function HoverIconButton({ path, label, off, on, active = false }: HoverIconProps) {
  const router = useRouter()
  const [hover, setHover] = useState(false)

  return (
    <IconButton
      onClick={() => router.push(path)}
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
