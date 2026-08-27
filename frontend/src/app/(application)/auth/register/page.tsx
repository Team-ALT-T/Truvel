'use client';

import { useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { useSignup } from '@/lib/hooks/useAuth';

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

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1C1C1C;
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

// 약관 동의 화면 스타일
const TermsContainer = styled.div`
  margin-bottom: 32px;
  flex: 1;
`;

const AllAgreeSection = styled.div`
  background-color: #EAEAEA;
  padding: 16px;
  border-radius: 18px;
  margin-top: 25px;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-right: 12px;
  accent-color: #3CA6FF;
  border-radius: 50%;
  appearance: none;
  border: 2px solid #d1d5db;
  background-color: white;
  cursor: pointer;
  
  &:checked {
    background-color: #3CA6FF;
    border-color: #3CA6FF;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 6px;
      background-color: white;
      border-radius: 50%;
    }
  }
`;

const AllAgreeText = styled.label`
  font-size: 16px;
  font-weight: 600;
  color: #1C1C1C;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const TermsSection = styled.div`
  margin-bottom: 24px;
`;

const TermsTitle = styled.h2`
  font-size: 14px;
  font-weight: 500;
  color: #1C1C1C;
  margin: 0 0 16px 0;
`;

const TermItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const TermLeft = styled.div`
  display: flex;
  align-items: center;
`;

const TermText = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #1C1C1C;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex: 1;
`;

const RequiredTag = styled.span`
  color: #1C1C1C;
  font-weight: 500;
  font-size: 14px;
`;

const OptionalTag = styled.span`
  color: #1C1C1C;
  font-weight: 500;
  font-size: 14px;
`;

const ViewButton = styled.button`
  background-color: #EAEAEA;
  border: none;
  color: #777777;
  font-size: 12px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 16px;
  
  &:hover {
    background-color: #d1d5db;
  }
`;

const InfoText = styled.div`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 210px;
  text-align: left;
`;

const NextButton = styled.button<{ $isValid: boolean }>`
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

// 회원 정보 입력 화면 스타일
const FormContainer = styled.div`
  margin-bottom: 32px;
  flex: 1;
`;

const InputGroup = styled.div`
  margin-bottom: 32px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.$hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 10px;
  font-size: 16px;
  color: #111827;
  background-color: white;
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const HelperText = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
`;

const ErrorText = styled.p`
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
`;

const PasswordRequirements = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const RequirementItem = styled.div<{ $isValid: boolean }>`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: ${props => props.$isValid ? '#10b981' : '#6b7280'};
`;

const RequirementDot = styled.div<{ $isValid: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${props => props.$isValid ? '#10b981' : '#d1d5db'};
  margin-right: 6px;
`;

const ContinueButton = styled.button<{ $isValid: boolean }>`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background-color: ${props => props.$isValid ? '#3b82f6' : '#e5e7eb'};
  color: ${props => props.$isValid ? 'white' : '#9ca3af'};
  cursor: ${props => props.$isValid ? 'pointer' : 'not-allowed'};
  transition: all 0.2s;
  margin-top: auto;
`;

export default function RegisterPage() {
  const [step, setStep] = useState<'terms' | 'info'>('terms');
  const [agreements, setAgreements] = useState({
    all: false,
    age: false,
    service: false,
    privacy: false,
    location: false,
    thirdParty: false,
  });
  
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [passwordValid, setPasswordValid] = useState({
    hasLetter: false,
    hasNumber: false,
    hasSpecial: false,
    hasLength: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const signupMutation = useSignup();

  // 약관 동의 처리
  const handleAllAgree = () => {
    const newValue = !agreements.all;
    setAgreements({
      all: newValue,
      age: newValue,
      service: newValue,
      privacy: newValue,
      location: newValue,
      thirdParty: newValue,
    });
  };

  const handleAgreementChange = (key: keyof typeof agreements) => {
    const newAgreements = { ...agreements, [key]: !agreements[key] };
    
    // 모든 필수 항목이 체크되었는지 확인
    const allRequired = newAgreements.age && newAgreements.service && newAgreements.privacy;
    newAgreements.all = allRequired;
    
    setAgreements(newAgreements);
  };

  const isTermsValid = agreements.age && agreements.service && agreements.privacy;

  // 회원 정보 입력 처리
  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // 비밀번호 유효성 검사
    if (field === 'password') {
      setPasswordValid({
        hasLetter: /[a-zA-Z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        hasLength: value.length >= 8 && value.length <= 16,
      });
      
      // 비밀번호가 변경되면 비밀번호 확인 오류도 체크
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다' }));
      } else if (formData.confirmPassword && value === formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
    
    // 비밀번호 확인 필드가 변경되면 일치 여부 체크
    if (field === 'confirmPassword') {
      if (formData.password && value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다' }));
      } else if (formData.password && value === formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요';
    } else if (formData.nickname.length > 10) {
      newErrors.nickname = '닉네임은 10자까지 가능합니다';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요';
    }
    
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (!Object.values(passwordValid).every(Boolean)) {
      newErrors.password = '비밀번호 조건을 모두 만족해주세요';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = formData.nickname.trim() && 
                     formData.email.trim() && 
                     formData.password && 
                     formData.confirmPassword &&
                     Object.values(passwordValid).every(Boolean) &&
                     formData.password === formData.confirmPassword;

  const handleNext = async () => {
    if (step === 'terms' && isTermsValid) {
      setStep('info');
    } else if (step === 'info' && validateForm()) {
      setIsLoading(true);
      setErrors({});

      try {
        await signupMutation.mutateAsync({
          email: formData.email,
          nickname: formData.nickname,
          password: formData.password,
          agreeTerms: agreements.service,
          agreePrivacy: agreements.privacy,
          agreeThirdParty: agreements.thirdParty,
          locationConsent: agreements.location,
        });
        // 성공 시 useSignup 훅에서 자동으로 /auth/verify로 이동
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || '회원가입에 실패했습니다.';
        
        // 에러 메시지를 적절한 필드에 매핑
        if (errorMessage.includes('이메일')) {
          setErrors({ email: errorMessage });
        } else if (errorMessage.includes('닉네임')) {
          setErrors({ nickname: errorMessage });
        } else {
          setErrors({ general: errorMessage });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 'info') {
      setStep('terms');
    } else {
      window.history.back();
    }
  };

  return (
    <Container>
      <Content>
        <Header>
          <BackButton onClick={handleBack}>
            <Image src="/icons/Larrow.png" alt="뒤로가기" width={24} height={24} />
          </BackButton>
        </Header>

        {step === 'terms' ? (
          <>
            <Title>원활한 서비스 이용을 위해<br />이용약관에 동의해주세요</Title>
            
            <TermsContainer>
              <AllAgreeSection>
                <Checkbox
                  type="checkbox"
                  checked={agreements.all}
                  onChange={handleAllAgree}
                />
                <AllAgreeText>네, 모두 동의합니다</AllAgreeText>
              </AllAgreeSection>

              <TermsSection>
                <TermsTitle>서비스 이용약관</TermsTitle>
                
                <TermItem>
                  <TermLeft>
                    <Checkbox
                      type="checkbox"
                      checked={agreements.age}
                      onChange={() => handleAgreementChange('age')}
                    />
                    <TermText>
                      <RequiredTag>[필수]</RequiredTag> 만 14세 이상입니다
                    </TermText>
                  </TermLeft>
                </TermItem>

                <TermItem>
                  <TermLeft>
                    <Checkbox
                      type="checkbox"
                      checked={agreements.service}
                      onChange={() => handleAgreementChange('service')}
                    />
                    <TermText>
                      <RequiredTag>[필수]</RequiredTag> 서비스 이용약관 동의
                    </TermText>
                  </TermLeft>
                  <ViewButton>보기</ViewButton>
                </TermItem>

                <TermItem>
                  <TermLeft>
                    <Checkbox
                      type="checkbox"
                      checked={agreements.privacy}
                      onChange={() => handleAgreementChange('privacy')}
                    />
                    <TermText>
                      <RequiredTag>[필수]</RequiredTag> 개인정보 수집 및 이용 동의
                    </TermText>
                  </TermLeft>
                  <ViewButton>보기</ViewButton>
                </TermItem>

                <TermItem>
                  <TermLeft>
                    <Checkbox
                      type="checkbox"
                      checked={agreements.location}
                      onChange={() => handleAgreementChange('location')}
                    />
                    <TermText>
                      <OptionalTag>[선택]</OptionalTag> 위치기반 서비스 이용약관 동의
                    </TermText>
                  </TermLeft>
                  <ViewButton>보기</ViewButton>
                </TermItem>

                <TermItem>
                  <TermLeft>
                    <Checkbox
                      type="checkbox"
                      checked={agreements.thirdParty}
                      onChange={() => handleAgreementChange('thirdParty')}
                    />
                    <TermText>
                      <OptionalTag>[선택]</OptionalTag> 제 3자 개인정보 제공 동의
                    </TermText>
                  </TermLeft>
                  <ViewButton>보기</ViewButton>
                </TermItem>
              </TermsSection>
            </TermsContainer>

            <InfoText>
              -선택 항목에 동의하지 않아도 서비스 이용이 가능합니다<br />
              -개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으며<br />
              -동의 거부시 회원 서비스 이용이 제한됩니다
            </InfoText>

            <NextButton $isValid={isTermsValid} onClick={handleNext}>
              다음
            </NextButton>
          </>
        ) : (
          <>
            <Title>Truvel이 처음이신가요?<br></br>회원 정보를 입력해주세요</Title>
            
            <FormContainer style={{ marginTop: '40px' }}>
              <InputGroup>
                <InputLabel>닉네임을 입력해주세요</InputLabel>
                <Input
                  type="text"
                  value={formData.nickname}
                  onChange={handleInputChange('nickname')}
                  placeholder="맛따라"
                  $hasError={Boolean(errors.nickname)}
                />
                <HelperText>닉네임은 한글, 영문 10자까지 가능해요</HelperText>
                {errors.nickname && <ErrorText>{errors.nickname}</ErrorText>}
              </InputGroup>

              <InputGroup>
                <InputLabel>이메일을 입력해주세요</InputLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="example@mtr.com"
                  $hasError={Boolean(errors.email)}
                />
                {errors.email && <ErrorText>{errors.email}</ErrorText>}
              </InputGroup>

              <InputGroup>
                <InputLabel>비밀번호를 입력해주세요</InputLabel>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder="영문, 숫자, 특수문자를 조합한 8-16자"
                  $hasError={Boolean(errors.password)}
                />
                <PasswordRequirements>
                  <RequirementItem $isValid={passwordValid.hasLetter}>
                    <RequirementDot $isValid={passwordValid.hasLetter} />
                    영문
                  </RequirementItem>
                  <RequirementItem $isValid={passwordValid.hasNumber}>
                    <RequirementDot $isValid={passwordValid.hasNumber} />
                    숫자
                  </RequirementItem>
                  <RequirementItem $isValid={passwordValid.hasSpecial}>
                    <RequirementDot $isValid={passwordValid.hasSpecial} />
                    특수문자
                  </RequirementItem>
                  <RequirementItem $isValid={passwordValid.hasLength}>
                    <RequirementDot $isValid={passwordValid.hasLength} />
                    8-16자
                  </RequirementItem>
                </PasswordRequirements>
                {errors.password && <ErrorText>{errors.password}</ErrorText>}
              </InputGroup>

              <InputGroup>
                <InputLabel>비밀번호를 확인할게요</InputLabel>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  placeholder="동일한 비밀번호를 입력해주세요"
                  $hasError={Boolean(errors.confirmPassword)}
                />
                {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
              </InputGroup>
            </FormContainer>

            {errors.general && (
              <ErrorText style={{ marginBottom: '12px' }}>{errors.general}</ErrorText>
            )}
            <ContinueButton 
              $isValid={Boolean(isFormValid) && !isLoading} 
              onClick={handleNext}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? '처리 중...' : '계속하기'}
            </ContinueButton>
          </>
        )}
      </Content>
    </Container>
  );
}
