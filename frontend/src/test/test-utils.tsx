/**
 * 테스트 유틸리티
 *
 * TanStack Query를 사용하는 컴포넌트 테스트 시
 * QueryClientProvider로 자동 감싸주는 커스텀 render 함수
 */
import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * 테스트용 QueryClient 생성
 * - retry: false → API 실패 시 재시도하지 않음 (테스트 속도 향상)
 * - gcTime: 0 → 테스트 간 캐시 간섭 방지
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * QueryClientProvider로 감싼 커스텀 render
 *
 * 사용법:
 *   import { renderWithProviders } from "@/test/test-utils";
 *   renderWithProviders(<LoginPage />);
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const testQueryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient: testQueryClient,
  };
}
