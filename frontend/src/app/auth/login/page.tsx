'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useLogin } from '@/lib/hooks/useAuth';

const Container = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;

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
  margin: 0 auto;
  padding: 100px 20px 24px 20px;
  position: relative;
  z-index: 2;
`;

const Header = styled.div`
  text-align: left;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 20px;
  line-height: 1.4;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const LoginSection = styled.div`
  margin-bottom: 28px;
`;

const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 12px 0;
`;

const InputContainer = styled.div`
  margin-bottom: 20px;
`;

const EmailInput = styled.input<{ $hasError: boolean }>`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${p => (p.$hasError ? '#ef4444' : '#e5e7eb')};
  border-radius: 10px;
  font-size: 16px;
  color: #111827;
  background-color: #ffffff;

  &::placeholder { color: #9ca3af; }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
  }
`;

const PasswordInput = styled(EmailInput)`
  margin-top: 12px;
`;

const ErrorMessage = styled.p`
  margin-top: 6px;
  font-size: 15px;
  color: #FF2727;
`;

const ContinueButton = styled.button<{ $isValid: boolean }>`
  width: 100%;
  padding: 12px 16px;
  margin-top: 12px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  background-color: ${p => (p.$isValid ? '#3CA6FF' : '#e5e7eb')};
  color: ${p => (p.$isValid ? 'white' : '#111827')};
  cursor: ${p => (p.$isValid ? 'pointer' : 'not-allowed')};
  opacity: ${p => (p.$isValid ? 1 : 0.8)};
  transition: all 0.2s;
`;

const SignupButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  margin-top: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  background-color: #3CA6FF;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin-top: 70px;
  margin-bottom: 30px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #e5e7eb;
  }
`;

const DividerText = styled.span`
  padding: 0 12px;
  font-size: 13px;
  color: #111827;
  font-weight: 500;
`;

const SocialButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
`;

const SocialButton = styled.button`
  width: 55px;
  height: 55px;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: bold;
`;

const KakaoButton = styled(SocialButton)`
  background-color: #FFEB3B;
  color: black;
  &:hover { background-color: #FFEB3B; }
`;

const KakaoIcon = styled.div`
  width: 24px; height: 24px; position: relative; display: flex;
  align-items: center; justify-content: center;
  &::before {
    content: ''; position: absolute; width: 20px; height: 16px;
    background-color: black; border-radius: 8px 8px 8px 2px;
  }
  &::after {
    content: 'TALK'; position: absolute; font-size: 6px;
    font-weight: bold; color: white; line-height: 1;
  }
`;

const NaverButton = styled(SocialButton)`
  background-color: #00BF18; color: white; font-size: 18px; font-weight: bold;
`;

const AppleButton = styled(SocialButton)`
  background-color: #1C1C1C; color: white;
`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = useLogin();

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setEmail(v);
    setLoginError('');
    if (v.length > 0) {
      const ok = validateEmail(v);
      setIsValidEmail(ok);
      setShowEmailError(!ok);
    } else {
      setIsValidEmail(false);
      setShowEmailError(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setLoginError('');
  };

  const handleLogin = async () => {
    if (!isValidEmail || !password) {
      setLoginError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      await loginMutation.mutateAsync({
        email,
        password,
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '로그인에 실패했습니다.';
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: 소셜 로그인 로직 구현
    console.log(`${provider} 로그인 시도`);
  };

  const handleSignup = () => {
    window.location.href = '/auth/register';
  };

  const isFormValid = isValidEmail && password.length > 0;

  return (
    <Container>
      
      <Content>
        <Header>
          <Title>
            Truvel과 함께<br />최적 경로로 손쉽게 여행하세요!
          </Title>
        </Header>

        <LoginSection>
          <SectionTitle>이메일 로그인</SectionTitle>
          <InputContainer>
            <EmailInput
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="example@mtr.com"
              $hasError={showEmailError}
            />
            {showEmailError && (
              <ErrorMessage>형식에 맞지 않은 이메일 주소예요</ErrorMessage>
            )}
            <PasswordInput
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="비밀번호를 입력해주세요"
              $hasError={false}
            />
            {loginError && (
              <ErrorMessage>{loginError}</ErrorMessage>
            )}
          </InputContainer>

          <ContinueButton 
            disabled={!isFormValid || isLoading} 
            $isValid={isFormValid && !isLoading}
            onClick={handleLogin}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </ContinueButton>
          <SignupButton onClick={handleSignup}>회원가입</SignupButton>
        </LoginSection>

        <Divider>
          <DividerText>소셜 로그인</DividerText>
        </Divider>

        <SocialButtons>
          <KakaoButton onClick={() => handleSocialLogin('kakao')}><KakaoIcon /></KakaoButton>
          <NaverButton onClick={() => handleSocialLogin('naver')}>N</NaverButton>
          <AppleButton onClick={() => handleSocialLogin('apple')}>
            {/* Apple 로고 (SVG) */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </AppleButton>
        </SocialButtons>
      </Content>
    </Container>
  );
}
