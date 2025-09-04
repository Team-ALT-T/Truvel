'use client'

import React from 'react'
import Image from 'next/image'
import styled from 'styled-components'

interface Props {
  onClose: () => void
}

export default function DefaultModal({ onClose }: Props) {
  return (
    <>
      <Backdrop />

      <ModalWrapper>
        <ModalBox>
          <IconWrapper>
            <Image
              src="/icons/warning.png"
              alt="안내 아이콘"
              width={28}
              height={28}
            />
          </IconWrapper>

          <Title>기본 화면이 바뀌었어요</Title>
          <Description>
            여행 중인 상태에서는 기본 화면이 ‘내 여행’으로 바뀌어요.
            원하지 않는다면 설정에서 다시 바꿀 수 있어요.
          </Description>

          <ConfirmButton onClick={onClose}>확인</ConfirmButton>
        </ModalBox>
      </ModalWrapper>
    </>
  )
}

// ✅ styled-components
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: #E3E3E3;
  opacity: 0.8;
  z-index: 40;
`

const ModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  padding: 0 1.5rem;
`

const ModalBox = styled.div`
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
`

const Title = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: #1C1C1C;
  margin-bottom: 0.5rem;
`

const Description = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: #777777;
  margin-bottom: 1rem;
  line-height: 1.5;
`

const ConfirmButton = styled.button`
  background-color: #3CA6FF;
  color: white;
  width: 100%;
  padding: 0.5rem 0;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #3399EE;
  }
`
