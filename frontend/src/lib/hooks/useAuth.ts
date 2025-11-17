import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login, signup, LoginRequest, SignUpRequest, sendVerificationCode, verifyEmailCode, EmailVerificationConfirmRequest } from '../api/auth';

// 로그인 훅
export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      // 토큰 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      // 성공 페이지로 이동 또는 홈으로
      router.push('/auth/success');
    },
    onError: (error: any) => {
      console.error('로그인 실패:', error);
      // 에러 메시지는 컴포넌트에서 처리
    },
  });
};

// 회원가입 훅
export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignUpRequest) => {
      // 회원가입 먼저 실행
      const signupResponse = await signup(data);
      
      // 회원가입 성공 후 이메일 인증 코드 발송
      try {
        await sendVerificationCode(data.email);
      } catch (emailError) {
        console.error('이메일 발송 실패:', emailError);
        // 이메일 발송 실패해도 회원가입은 성공했으므로 계속 진행
      }
      
      return signupResponse;
    },
    onSuccess: (response, variables) => {
      // 이메일 주소를 localStorage에 저장 (verify 페이지에서 사용)
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingVerificationEmail', variables.email);
      }
      // 회원가입 성공 후 이메일 인증 페이지로 이동
      router.push(`/auth/verify?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error: any) => {
      console.error('회원가입 실패:', error);
      // 에러 메시지는 컴포넌트에서 처리
    },
  });
};

// 이메일 인증 코드 발송 훅
export const useSendVerificationCode = () => {
  return useMutation({
    mutationFn: (email: string) => sendVerificationCode(email),
    onError: (error: any) => {
      console.error('이메일 발송 실패:', error);
    },
  });
};

// 이메일 인증 코드 확인 훅
export const useVerifyEmailCode = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: EmailVerificationConfirmRequest) => verifyEmailCode(data.email, data.code),
    onSuccess: () => {
      // 인증 성공 시 성공 페이지로 이동
      router.push('/auth/success');
    },
    onError: (error: any) => {
      console.error('이메일 인증 실패:', error);
    },
  });
};

