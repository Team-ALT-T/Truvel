import axios from 'axios';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 처리 (토큰 만료 등)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 리프레시 토큰으로 재시도 로직 (필요시 구현)
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // TODO: 리프레시 토큰 API 호출
          // const response = await axios.post('/auth/refresh', { refreshToken });
          // localStorage.setItem('accessToken', response.data.accessToken);
          // originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          // return apiClient(originalRequest);
        } catch (refreshError) {
          // 리프레시 실패 시 로그아웃 처리
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // 리프레시 토큰이 없으면 로그인 페이지로
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

