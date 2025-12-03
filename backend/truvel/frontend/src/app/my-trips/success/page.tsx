'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import DefaultModal from '../components/DefaultModal'
import styled from 'styled-components'

export default function TripRegisterSuccessPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(true)

  const handleModalClose = () => {
    setShowModal(false)
  }

  return (
    <Wrapper>
      <Content>
        <Image
          src="/icons/image1.png"
          alt="여행 등록 성공"
          width={160}
          height={160}
          style={{ marginBottom: '1.5rem' }}
        />
        <Title>준비가 모두 끝났어요!</Title>
        <Subtitle>즐거운 여행 되세요 :)</Subtitle>
      </Content>

      <GoTripButton onClick={() => router.push('/my-trips')}>
        내 여행으로
      </GoTripButton>

      {showModal && <DefaultModal onClose={handleModalClose} />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: #FAF8F6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 1.5rem 2.5rem;
  position: relative;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1C1C1C;
  margin-bottom: 0.5rem;
`

const Subtitle = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1C1C1C;
  margin-bottom: 0.5rem;
`

const GoTripButton = styled.button`
  margin-top: 10rem;
  width: 100%;
  max-width: 24rem;
  background-color: #3CA6FF;
  color: white;
  font-weight: 600;
  padding: 0.75rem 0;
  border-radius: 0.75rem;
  transition: background-color 0.2s ease, filter 0.2s ease;

  &:hover {
    background-color: #3399EE;
    filter: brightness(105%);
  }
`
