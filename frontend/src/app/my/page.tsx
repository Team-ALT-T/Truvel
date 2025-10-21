'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styled from 'styled-components'

interface HoverIconProps {
  path: string
  label: string
  off: string
  on: string
  active?: boolean
}

const MyPage = () => {
  const router = useRouter()
  return (
    <PageContainer>
      <TopBar>
        <BackButton onClick={() => router.back()}>
          <Image src="/icons/Larrow.png" alt="back" width={20} height={20} />
        </BackButton>
      </TopBar>

      <Content>내용은 추후 개발 예정</Content>

      <Footer>
        <HoverIconButton path="/home" label="홈" off="/icons/home-off.png" on="/icons/home-on.png" />
        <HoverIconButton path="/my-trips" label="내 여행" off="/icons/trip-off.png" on="/icons/trip-on.png" />
        <HoverIconButton path="/map" label="지도" off="/icons/map-off.png" on="/icons/map-on.png" />
        <HoverIconButton path="/account" label="가계부" off="/icons/money-off.png" on="/icons/money-on.png" />
        <HoverIconButton path="/my" label="MY" off="/icons/my-off.png" on="/icons/my-on.png" active />
      </Footer>
    </PageContainer>
  )
}

export default MyPage

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
  const [hover, setHover] = React.useState(false)
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

const TopBar = styled.div`
  width: 100%;
  max-width: 1024px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
`

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`

const Content = styled.div`
  width: 100%;
  max-width: 1024px;
  padding: 0 1rem;
  color: #777777;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: calc(100vh - 4rem - 3rem);
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


