'use client';

import { useState } from 'react';
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

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  margin-right: 16px;
`;

const VerificationContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const VerificationTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1C1C1C;
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

const VerificationSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.5;
`;

const CodeInputContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 450px;
`;

const CodeInput = styled.input`
  width: 70px;
  height: 70px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 60px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #1C1C1C;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const ResendLink = styled.button`
  background: none;
  border: none;
  color: #777777;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
  margin-bottom: 24px;
  
`;

const VerifyButton = styled.button<{ $isValid: boolean }>`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background-color: ${props => props.$isValid ? '#3CA6FF' : '#e5e7eb'};
  color: ${props => props.$isValid ? 'white' : '#9ca3af'};
  cursor: ${props => props.$isValid ? 'pointer' : 'not-allowed'};
  transition: all 0.2s;
  margin-top: auto;
`;

export default function VerifyPage() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerificationValid, setIsVerificationValid] = useState(false);

  // 인증 코드 입력 처리
  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // 한 글자만 입력 가능
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // 모든 필드가 채워졌는지 확인
    const isComplete = newCode.every(code => code !== '');
    setIsVerificationValid(isComplete);
    
    // 다음 필드로 자동 이동
    if (value && index < 5) {
      const nextInput = document.getElementById(`verification-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleResendEmail = () => {
    // TODO: 이메일 재전송 로직 구현
    console.log('이메일 재전송');
  };

  const handleVerify = () => {
    if (isVerificationValid) {
      // 완료 페이지로 이동
      window.location.href = '/auth/success';
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <Container>
      <Content>
        <Header>
          <BackButton onClick={handleBack}>
            <Image src="/icons/Larrow.png" alt="뒤로가기" width={24} height={24} />
          </BackButton>
        </Header>

        <VerificationContainer>
          <VerificationTitle>인증코드를 보내드렸어요</VerificationTitle>
          <VerificationSubtitle>
            입력해주신 이메일 example@mtr.com 로 인증코드를 보내드렸어요
          </VerificationSubtitle>
          
          <CodeInputContainer>
            {verificationCode.map((code, index) => (
              <CodeInput
                key={index}
                id={`verification-${index}`}
                type="text"
                maxLength={1}
                value={code}
                onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !code && index > 0) {
                    const prevInput = document.getElementById(`verification-${index - 1}`);
                    if (prevInput) {
                      prevInput.focus();
                    }
                  }
                }}
              />
            ))}
          </CodeInputContainer>
          
          <ResendLink onClick={handleResendEmail}>
            인증메일 다시 보내기
          </ResendLink>
          
          <VerifyButton $isValid={isVerificationValid} onClick={handleVerify}>
            인증하기
          </VerifyButton>
        </VerificationContainer>
      </Content>
    </Container>
  );
}
