'use client';

import styled from 'styled-components';
import Image from 'next/image';

const Container = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  display: flex;
  flex-direction: column;

  /* 좌우 연한 테두리 */
  &::before,
  &::after {
    content: '';
    position: fixed;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #fdf2f8;
    z-index: 1;
  }
  &::before { left: 0; }
  &::after { right: 0; }
`;

const Content = styled.div`
  max-width: 470px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px;
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 2;

  @media (min-width: 768px) {
    max-width: 600px;
    padding: 32px 40px;
  }

  @media (min-width: 1024px) {
    max-width: 700px;
    padding: 40px 60px;
  }

  @media (min-width: 1440px) {
    max-width: 800px;
    padding: 48px 80px;
  }
`;

const SuccessContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  padding-top: 80px;
`;

const SuccessTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1C1C1C;
  margin: 0 0 60px 0;
  text-align: left;
`;


const SuccessMessage = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #1C1C1C;
  margin: 25px 0 60px 0;
`;

const PlaneImage = styled.div`
  width: 150px;
  height: 150px;
  margin-top: 90px ;
`;

const HomeButton = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background-color: #3CA6FF;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: auto;
  
  &:hover {
    background-color: #2563eb;
  }
`;

export default function SuccessPage() {
  const handleGoHome = () => {
    // 홈 화면으로 이동
    window.location.href = '/my-trips';
  };

  return (
    <Container>
      <Content>
        <SuccessContainer>
          <SuccessTitle>환영해요! <br></br>Truvel과 함께 즐거운 여행해봐요</SuccessTitle>
          
          <PlaneImage>
            <Image src="/icons/plane.png" alt="비행기" width={160} height={160} />
          </PlaneImage>
          
          <SuccessMessage>회원가입,로그인이 완료되었어요!</SuccessMessage>
          
          <HomeButton onClick={handleGoHome}>
            홈 화면으로
          </HomeButton>
        </SuccessContainer>
      </Content>
    </Container>
  );
}
