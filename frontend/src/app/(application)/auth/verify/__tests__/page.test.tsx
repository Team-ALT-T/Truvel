import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Next.js 모킹 ───────────────────────────────────────────
const mockPush = vi.fn();

// useSearchParams를 안정적인 참조로 반환해야 함
// 매번 새 객체를 반환하면 useEffect의 [searchParams] 의존성이
// 매 렌더마다 변경되어 무한 재실행됨
const mockSearchParams = {
  get: (key: string) => (key === "email" ? "test@example.com" : null),
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} alt={props.alt || ""} />;
  },
}));

// ─── useAuth 훅 모킹 ────────────────────────────────────────
// 마운트 시 자동 API 호출(useEffect → mutateAsync)이 테스트를 멈추게 하므로
// 훅 자체를 가짜로 대체합니다.
// MSW 없이도 안정적으로 동작하며, 유닛 테스트로서 UI 로직에 집중합니다.
const mockSendCode = vi.fn().mockResolvedValue({ success: true, message: "인증코드가 발송되었습니다." });
const mockVerifyCode = vi.fn().mockResolvedValue({ success: true, message: "이메일 인증이 완료되었습니다." });

vi.mock("@/lib/hooks/useAuth", () => ({
  useSendVerificationCode: () => ({
    mutateAsync: mockSendCode,
    isPending: false,
  }),
  useVerifyEmailCode: () => ({
    mutateAsync: mockVerifyCode,
    isPending: false,
  }),
}));

import VerifyPage from "../page";

describe("VerifyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: UI 렌더링
  // ═══════════════════════════════════════════════════════════

  describe("UI 렌더링", () => {
    it("페이지 기본 요소들이 렌더링된다", () => {
      render(<VerifyPage />);

      expect(screen.getByText("인증코드를 보내드렸어요")).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
      expect(screen.getByText("인증하기")).toBeInTheDocument();

      // 6개의 코드 입력 필드
      for (let i = 0; i < 6; i++) {
        expect(document.getElementById(`verification-${i}`)).toBeInTheDocument();
      }
    });

    it("페이지 로드 시 자동으로 인증코드 발송이 호출된다", async () => {
      render(<VerifyPage />);

      // useEffect에서 handleSendEmail → mutateAsync가 호출되었는지 확인
      await waitFor(() => {
        expect(mockSendCode).toHaveBeenCalledWith("test@example.com");
      });
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 코드 입력 UX
  // ═══════════════════════════════════════════════════════════

  describe("코드 입력 UX", () => {
    it("숫자 입력 시 다음 필드로 자동 포커스된다", async () => {
      const user = userEvent.setup();
      render(<VerifyPage />);

      const firstInput = document.getElementById("verification-0") as HTMLInputElement;
      const secondInput = document.getElementById("verification-1") as HTMLInputElement;

      await user.click(firstInput);
      await user.keyboard("1");

      // 두 번째 필드로 포커스 이동
      expect(document.activeElement).toBe(secondInput);
    });

    it("6자리 순차 입력이 각 필드에 올바르게 들어간다", async () => {
      const user = userEvent.setup();
      render(<VerifyPage />);

      const firstInput = document.getElementById("verification-0") as HTMLInputElement;
      await user.click(firstInput);
      await user.keyboard("123456");

      // 각 필드에 한 자리씩 들어가 있는지 확인
      for (let i = 0; i < 6; i++) {
        const input = document.getElementById(`verification-${i}`) as HTMLInputElement;
        expect(input.value).toBe(String(i + 1));
      }
    });

    it("6자리 모두 입력하면 인증 버튼이 활성화된다", async () => {
      const user = userEvent.setup();
      render(<VerifyPage />);

      const firstInput = document.getElementById("verification-0") as HTMLInputElement;
      await user.click(firstInput);
      await user.keyboard("123456");

      expect(screen.getByText("인증하기")).not.toBeDisabled();
    });

    it("6자리 미만이면 인증 버튼이 비활성화 상태다", async () => {
      const user = userEvent.setup();
      render(<VerifyPage />);

      const firstInput = document.getElementById("verification-0") as HTMLInputElement;
      await user.click(firstInput);
      await user.keyboard("123");

      expect(screen.getByText("인증하기")).toBeDisabled();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 인증 동작 (훅 모킹 기반)
  // ═══════════════════════════════════════════════════════════

  describe("인증 동작", () => {
    it("올바른 코드 입력 후 인증하기 클릭 시 verifyCode가 호출된다", async () => {
      const user = userEvent.setup();
      render(<VerifyPage />);

      // 6자리 입력
      const firstInput = document.getElementById("verification-0") as HTMLInputElement;
      await user.click(firstInput);
      await user.keyboard("123456");

      // 인증하기 클릭
      await user.click(screen.getByText("인증하기"));

      // verifyCode 훅이 이메일 + 코드와 함께 호출되었는지 확인
      await waitFor(() => {
        expect(mockVerifyCode).toHaveBeenCalledWith({
          email: "test@example.com",
          code: "123456",
        });
      });
    });

    it("인증 실패 시 에러 메시지가 표시되고 코드가 초기화된다", async () => {
      // 이 테스트에서만 verifyCode를 실패로 오버라이드
      // 컴포넌트의 catch: error?.response?.data?.message || error?.message
      // AxiosError 구조와 동일하게 맞춰야 함
      const axiosLikeError = new Error("Request failed");
      (axiosLikeError as any).response = {
        data: { message: "인증코드가 올바르지 않습니다." },
        status: 400,
      };
      mockVerifyCode.mockRejectedValueOnce(axiosLikeError);

      const user = userEvent.setup();
      render(<VerifyPage />);

      const firstInput = document.getElementById("verification-0") as HTMLInputElement;
      await user.click(firstInput);
      await user.keyboard("999999");

      await user.click(screen.getByText("인증하기"));

      // 에러 메시지 표시
      await waitFor(() => {
        expect(screen.getByText("인증코드가 올바르지 않습니다.")).toBeInTheDocument();
      });

      // 코드 필드 초기화
      for (let i = 0; i < 6; i++) {
        const input = document.getElementById(`verification-${i}`) as HTMLInputElement;
        expect(input.value).toBe("");
      }
    });

    it("'인증메일 다시 보내기' 클릭 시 sendCode가 재호출된다", async () => {
      const user = userEvent.setup();
      render(<VerifyPage />);

      // useEffect의 자동 발송으로 1회 호출 대기
      await waitFor(() => {
        expect(mockSendCode).toHaveBeenCalledTimes(1);
      });

      // 재발송 클릭
      await user.click(screen.getByText("인증메일 다시 보내기"));

      // 자동 발송(1회) + 재발송(1회) = 총 2회
      await waitFor(() => {
        expect(mockSendCode).toHaveBeenCalledTimes(2);
      });
    });

    it("인증 성공 후 localStorage에서 이메일이 제거된다", async () => {
      localStorage.setItem("pendingVerificationEmail", "test@example.com");

      const user = userEvent.setup();
      render(<VerifyPage />);

      const firstInput = document.getElementById("verification-0") as HTMLInputElement;
      await user.click(firstInput);
      await user.keyboard("123456");

      await user.click(screen.getByText("인증하기"));

      await waitFor(() => {
        expect(localStorage.getItem("pendingVerificationEmail")).toBeNull();
      });
    });
  });
});
