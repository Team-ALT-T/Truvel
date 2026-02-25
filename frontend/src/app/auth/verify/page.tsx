'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useSendVerificationCode, useVerifyEmailCode } from '@/lib/hooks/useAuth';

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
  gap: clamp(4px, 2vw, 8px);
  justify-content: center;
  margin: 24px 0 32px;
`;

const CodeInput = styled.input`
  width: clamp(38px, 11.5vw, 70px);
  height: clamp(48px, 11.5vw, 70px);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  font-size: clamp(16px, 4.5vw, 20px);
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  font-size: 14px;
  margin: 0;
  text-align: center;
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
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerificationValid, setIsVerificationValid] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const sendCodeMutation = useSendVerificationCode();
  const verifyCodeMutation = useVerifyEmailCode();

  // 이메일 발송
  const handleSendEmail = async (emailToSend: string) => {
    if (!emailToSend) {
      setError('이메일 주소가 없습니다.');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      await sendCodeMutation.mutateAsync(emailToSend);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '이메일 발송에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  // 이메일 주소 가져오기 (URL 파라미터 또는 localStorage)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('pendingVerificationEmail') : null;
    const userEmail = emailParam || storedEmail || '';
    setEmail(userEmail);

    // 페이지 로드 시 자동으로 이메일 발송
    if (userEmail) {
      handleSendEmail(userEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 인증 코드 입력 처리
  const handleVerificationCodeChange = (index: number, value: string) => {
    // 숫자만 입력 가능
    if (value && !/^\d$/.test(value)) return;
    if (value.length > 1) return; // 한 글자만 입력 가능
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setError('');
    
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
    if (email) {
      handleSendEmail(email);
    }
  };

  const handleVerify = async () => {
    if (!isVerificationValid || !email) {
      setError('인증 코드를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    const code = verificationCode.join('');

    try {
      await verifyCodeMutation.mutateAsync({ email, code });
      // 인증 성공 시 localStorage에서 이메일 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingVerificationEmail');
      }
      // useVerifyEmailCode 훅에서 자동으로 성공 페이지로 이동
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '인증에 실패했습니다.';
      setError(errorMessage);
      // 에러 시 코드 초기화
      setVerificationCode(['', '', '', '', '', '']);
      setIsVerificationValid(false);
    } finally {
      setIsLoading(false);
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
            입력해주신 이메일 {email || 'example@mtr.com'} 로 인증코드를 보내드렸어요
          </VerificationSubtitle>
          {error && (
            <ErrorText style={{ marginBottom: '16px', color: '#ef4444' }}>{error}</ErrorText>
          )}
          {isSending && (
            <ErrorText style={{ marginBottom: '16px', color: '#3b82f6' }}>이메일을 발송 중입니다...</ErrorText>
          )}
          
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
          
          <ResendLink onClick={handleResendEmail} disabled={isSending}>
            {isSending ? '발송 중...' : '인증메일 다시 보내기'}
          </ResendLink>
          
          <VerifyButton 
            $isValid={isVerificationValid && !isLoading} 
            onClick={handleVerify}
            disabled={!isVerificationValid || isLoading}
          >
            {isLoading ? '인증 중...' : '인증하기'}
          </VerifyButton>
        </VerificationContainer>
      </Content>
    </Container>
  );
}
