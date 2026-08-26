import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "@/test/test-utils";
import { server } from "@/mocks/server";

// ─── Next.js 모킹 ───────────────────────────────────────────
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} alt={props.alt || ""} />;
  },
}));

import LoginPage from "../page";

// ─── MSW 서버 시작/종료 ──────────────────────────────────────
// beforeAll: 모든 테스트 전에 MSW 서버 시작 (네트워크 요청 가로채기 시작)
// afterEach: 각 테스트 후에 핸들러 초기화 (테스트 간 간섭 방지)
// afterAll: 모든 테스트 후에 서버 종료
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // localStorage 초기화
    localStorage.clear();
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 순수 UI 로직 (API 호출 없음)
  // ═══════════════════════════════════════════════════════════

  describe("유닛 테스트 - UI 렌더링 및 유효성 검사", () => {
    it("페이지 기본 요소들이 렌더링된다", () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByText(/Truvel과 함께/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText("example@mtr.com")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("비밀번호를 입력해주세요")).toBeInTheDocument();
      expect(screen.getByText("로그인")).toBeInTheDocument();
      expect(screen.getByText("회원가입")).toBeInTheDocument();
      expect(screen.getByText("소셜 로그인")).toBeInTheDocument();
    });

    it("유효하지 않은 이메일 입력 시 에러 메시지가 표시된다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByPlaceholderText("example@mtr.com");
      await user.type(emailInput, "invalid-email");

      expect(screen.getByText("형식에 맞지 않은 이메일 주소예요")).toBeInTheDocument();
    });

    it("유효한 이메일 입력 시 에러 메시지가 사라진다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByPlaceholderText("example@mtr.com");

      // 유효하지 않은 이메일 → 에러 표시
      await user.type(emailInput, "invalid");
      expect(screen.getByText("형식에 맞지 않은 이메일 주소예요")).toBeInTheDocument();

      // 입력 지우고 유효한 이메일 입력 → 에러 사라짐
      await user.clear(emailInput);
      await user.type(emailInput, "test@example.com");
      expect(screen.queryByText("형식에 맞지 않은 이메일 주소예요")).not.toBeInTheDocument();
    });

    it("이메일과 비밀번호가 모두 입력되어야 로그인 버튼이 활성화된다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByPlaceholderText("example@mtr.com");
      const passwordInput = screen.getByPlaceholderText("비밀번호를 입력해주세요");
      const loginButton = screen.getByText("로그인");

      // 초기 상태: 비활성화
      expect(loginButton).toBeDisabled();

      // 이메일만 입력: 여전히 비활성화
      await user.type(emailInput, "test@example.com");
      expect(loginButton).toBeDisabled();

      // 비밀번호도 입력: 활성화
      await user.type(passwordInput, "password");
      expect(loginButton).not.toBeDisabled();
    });

    it("유효하지 않은 이메일이면 비밀번호가 있어도 로그인 버튼이 비활성화된다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      await user.type(screen.getByPlaceholderText("example@mtr.com"), "not-an-email");
      await user.type(screen.getByPlaceholderText("비밀번호를 입력해주세요"), "password");

      expect(screen.getByText("로그인")).toBeDisabled();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 통합 테스트: MSW를 통한 API 연동 테스트
  // ═══════════════════════════════════════════════════════════

  describe("통합 테스트 - 로그인 API 연동", () => {
    it("로그인 성공 시 토큰이 저장되고 성공 페이지로 이동한다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      // 유효한 이메일/비밀번호 입력 (handlers.ts에서 성공 조건)
      await user.type(screen.getByPlaceholderText("example@mtr.com"), "test@example.com");
      await user.type(screen.getByPlaceholderText("비밀번호를 입력해주세요"), "Password1!");

      // 로그인 클릭
      await user.click(screen.getByText("로그인"));

      // MSW가 성공 응답 → useLogin 훅이 토큰 저장 + 라우팅
      await waitFor(() => {
        expect(localStorage.getItem("accessToken")).toBe("mock-access-token");
        expect(localStorage.getItem("refreshToken")).toBe("mock-refresh-token");
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/auth/success");
      });
    });

    it("로그인 실패 시 에러 메시지가 표시된다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      // 틀린 비밀번호 입력
      await user.type(screen.getByPlaceholderText("example@mtr.com"), "test@example.com");
      await user.type(screen.getByPlaceholderText("비밀번호를 입력해주세요"), "WrongPassword");

      await user.click(screen.getByText("로그인"));

      // MSW가 401 응답 → 에러 메시지 표시
      await waitFor(() => {
        expect(screen.getByText("이메일 또는 비밀번호가 올바르지 않습니다.")).toBeInTheDocument();
      });

      // 토큰은 저장되지 않아야 함
      expect(localStorage.getItem("accessToken")).toBeNull();
    });

    it("서버 에러(500) 시 기본 에러 메시지가 표시된다", async () => {
      // 이 테스트에서만 핸들러를 오버라이드하여 500 에러 반환
      server.use(
        http.post("http://localhost:8080/auth/login", () => {
          return HttpResponse.json(
            { message: "서버 내부 오류가 발생했습니다." },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      await user.type(screen.getByPlaceholderText("example@mtr.com"), "test@example.com");
      await user.type(screen.getByPlaceholderText("비밀번호를 입력해주세요"), "Password1!");
      await user.click(screen.getByText("로그인"));

      await waitFor(() => {
        expect(screen.getByText("서버 내부 오류가 발생했습니다.")).toBeInTheDocument();
      });
    });

    it("로그인 중에는 '로그인 중...' 텍스트가 표시된다", async () => {
      // 응답을 지연시켜서 로딩 상태 확인
      server.use(
        http.post("http://localhost:8080/auth/login", async () => {
          // 200ms 지연
          await new Promise((resolve) => setTimeout(resolve, 200));
          return HttpResponse.json({
            message: "로그인 성공",
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            grantType: "Bearer",
          });
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      await user.type(screen.getByPlaceholderText("example@mtr.com"), "test@example.com");
      await user.type(screen.getByPlaceholderText("비밀번호를 입력해주세요"), "Password1!");
      await user.click(screen.getByText("로그인"));

      // 로딩 텍스트 표시
      expect(screen.getByText("로그인 중...")).toBeInTheDocument();

      // 로딩 완료 후 사라짐
      await waitFor(() => {
        expect(screen.queryByText("로그인 중...")).not.toBeInTheDocument();
      });
    });
  });
});
