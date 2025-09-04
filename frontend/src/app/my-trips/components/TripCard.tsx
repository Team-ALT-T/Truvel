'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'

interface TripCardProps {
  title: string
  location: string
  date: string
  daysLeft?: string
  showPeople?: boolean
  peopleCount?: number
}

export default function TripCard({
  title,
  location,
  date,
  daysLeft,
  showPeople,
  peopleCount = 3,
}: TripCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/trips/${encodeURIComponent(title)}`)
  }

  return (
    <CardContainer onClick={handleClick}>
      <Title>{title}</Title>

      {daysLeft && <DaysLeft>{daysLeft}</DaysLeft>}

      <IconRow>
        <Image src="/icons/location.png" alt="위치" width={14} height={14} className="mr-1" />
        {location}
      </IconRow>

      <IconRow>
        <Image src="/icons/date.png" alt="날짜" width={14} height={14} className="mr-1" />
        {date}
      </IconRow>

      {showPeople && (
        <PeopleRow>
          <Image src="/icons/people.png" alt="참여자" width={14} height={14} />
          <BlankList>
            {Array.from({ length: peopleCount }).map((_, i) => (
              <Image
                key={i}
                src="/icons/blank.png"
                alt="참여자 아이콘"
                width={16}
                height={16}
              />
            ))}
          </BlankList>
        </PeopleRow>
      )}

      <ArrowIcon
        src="/icons/arrow.png"
        alt="상세 이동"
        width={8}
        height={14}
      />
    </CardContainer>
  )
}

const CardContainer = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  &:hover {
    background-color: #f9f9f9;
  }
`

const Title = styled.h3`
  font-size: 16px;
  color: #1C1C1C;
  font-weight: 600;
  margin-bottom: 0.25rem;
`

const DaysLeft = styled.p`
  font-size: 14px;
  color: #1C1C1C;
  margin-bottom: 0.25rem;
`

const IconRow = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #1C1C1C;
  margin-bottom: 0.25rem;
`

const PeopleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
`

const BlankList = styled.div`
  display: flex;
  gap: 0.25rem;
`

const ArrowIcon = styled(Image)`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
`
