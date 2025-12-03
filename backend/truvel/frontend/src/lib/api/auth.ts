import apiClient from '../axios';

// 타입 정의
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  grantType: string;
}

export interface SignUpRequest {
  email: string;
  nickname: string;
  password: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeThirdParty: boolean;
  locationConsent: boolean;
}

export interface SignUpResponse {
  message: string;
  userId: number;
}

// 로그인 API
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
};

// 회원가입 API
export const signup = async (data: SignUpRequest): Promise<SignUpResponse> => {
  const response = await apiClient.post<SignUpResponse>('/auth/signup', data);
  return response.data;
};

// 로그아웃 API
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

// 이메일 인증 관련 타입
export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirmRequest {
  email: string;
  code: string;
}

export interface EmailVerificationResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// 이메일 인증 코드 발송 API
export const sendVerificationCode = async (email: string): Promise<EmailVerificationResponse<void>> => {
  const response = await apiClient.post<EmailVerificationResponse<void>>('/emails/send', { email });
  return response.data;
};

// 이메일 인증 코드 확인 API
export const verifyEmailCode = async (email: string, code: string): Promise<EmailVerificationResponse<void>> => {
  const response = await apiClient.post<EmailVerificationResponse<void>>('/emails/verify', { email, code });
  return response.data;
};

