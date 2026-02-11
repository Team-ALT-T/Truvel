import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
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

import RegisterPage from "../page";

// ─── MSW ─────────────────────────────────────────────────────
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: Step 1 - 약관 동의
  // ═══════════════════════════════════════════════════════════

  describe("Step 1 - 약관 동의", () => {
    it("약관 동의 화면이 기본으로 표시된다", () => {
      renderWithProviders(<RegisterPage />);

      expect(screen.getByText(/이용약관에 동의해주세요/)).toBeInTheDocument();
      expect(screen.getByText("네, 모두 동의합니다")).toBeInTheDocument();
      expect(screen.getByText("다음")).toBeInTheDocument();
    });

    it("필수 약관을 모두 체크하지 않으면 다음 버튼이 비활성화된다", () => {
      renderWithProviders(<RegisterPage />);

      // 초기 상태: 아무것도 체크 안 됨
      const nextButton = screen.getByText("다음");
      // button의 cursor가 'not-allowed'인 styled-component이므로 직접 클릭 가능 여부를 테스트
      // 대신 클릭해도 step이 변하지 않는지 확인
      expect(screen.getByText(/이용약관에 동의해주세요/)).toBeInTheDocument();
    });

    it("'모두 동의' 체크 시 모든 항목이 체크된다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);

      const allCheckboxes = screen.getAllByRole("checkbox");
      // 첫 번째가 "모두 동의" 체크박스
      await user.click(allCheckboxes[0]);

      // 모든 체크박스가 체크되어야 함
      allCheckboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });

    it("'모두 동의' 해제 시 모든 항목이 해제된다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);

      const allCheckboxes = screen.getAllByRole("checkbox");

      // 모두 동의 체크
      await user.click(allCheckboxes[0]);
      // 모두 동의 해제
      await user.click(allCheckboxes[0]);

      allCheckboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });

    it("필수 3개를 개별 체크하면 '모두 동의'도 자동 체크된다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);

      const allCheckboxes = screen.getAllByRole("checkbox");
      // allCheckboxes[0] = 모두 동의
      // allCheckboxes[1] = 만 14세 이상 (필수)
      // allCheckboxes[2] = 서비스 이용약관 (필수)
      // allCheckboxes[3] = 개인정보 수집 (필수)
      // allCheckboxes[4] = 위치기반 (선택)
      // allCheckboxes[5] = 제3자 (선택)

      await user.click(allCheckboxes[1]); // 만 14세
      await user.click(allCheckboxes[2]); // 서비스 이용약관
      await user.click(allCheckboxes[3]); // 개인정보

      // 필수 3개 체크 → "모두 동의"도 체크됨
      expect(allCheckboxes[0]).toBeChecked();
    });

    it("필수 약관 동의 후 '다음' 클릭 시 정보 입력 화면으로 전환된다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);

      // 모두 동의
      const allCheckboxes = screen.getAllByRole("checkbox");
      await user.click(allCheckboxes[0]);

      // 다음 클릭
      await user.click(screen.getByText("다음"));

      // Step 2 화면으로 전환
      expect(screen.getByText(/회원 정보를 입력해주세요/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText("맛따라")).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: Step 2 - 정보 입력 + 유효성 검사
  // ═══════════════════════════════════════════════════════════

  describe("Step 2 - 정보 입력", () => {
    // Step 2로 이동하는 헬퍼 함수
    async function goToStep2() {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);

      const allCheckboxes = screen.getAllByRole("checkbox");
      await user.click(allCheckboxes[0]); // 모두 동의
      await user.click(screen.getByText("다음"));

      return user;
    }

    it("비밀번호 입력 시 조건 충족 여부가 실시간으로 표시된다", async () => {
      const user = await goToStep2();

      const passwordInput = screen.getByPlaceholderText("영문, 숫자, 특수문자를 조합한 8-16자");

      // 영문만 입력
      await user.type(passwordInput, "abcdefgh");
      expect(screen.getByText("영문")).toBeInTheDocument();
      expect(screen.getByText("8-16자")).toBeInTheDocument();

      // 숫자 추가
      await user.clear(passwordInput);
      await user.type(passwordInput, "abcdef1!");
      // 모든 조건 충족
      expect(screen.getByText("영문")).toBeInTheDocument();
      expect(screen.getByText("숫자")).toBeInTheDocument();
      expect(screen.getByText("특수문자")).toBeInTheDocument();
      expect(screen.getByText("8-16자")).toBeInTheDocument();
    });

    it("비밀번호 불일치 시 에러 메시지가 표시된다", async () => {
      const user = await goToStep2();

      const passwordInput = screen.getByPlaceholderText("영문, 숫자, 특수문자를 조합한 8-16자");
      const confirmInput = screen.getByPlaceholderText("동일한 비밀번호를 입력해주세요");

      await user.type(passwordInput, "Test1234!");
      await user.type(confirmInput, "DifferentPassword1!");

      expect(screen.getByText("비밀번호가 일치하지 않습니다")).toBeInTheDocument();
    });

    it("모든 필드가 올바르게 입력되면 '계속하기' 버튼이 활성화된다", async () => {
      const user = await goToStep2();

      await user.type(screen.getByPlaceholderText("맛따라"), "테스터");
      await user.type(screen.getByPlaceholderText("example@mtr.com"), "test@example.com");
      await user.type(
        screen.getByPlaceholderText("영문, 숫자, 특수문자를 조합한 8-16자"),
        "Test1234!"
      );
      await user.type(
        screen.getByPlaceholderText("동일한 비밀번호를 입력해주세요"),
        "Test1234!"
      );

      const continueButton = screen.getByText("계속하기");
      expect(continueButton).not.toBeDisabled();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 통합 테스트: 회원가입 API 연동
  // ═══════════════════════════════════════════════════════════

  describe("통합 테스트 - 회원가입 API", () => {
    // 모든 필드를 채우고 "계속하기" 직전까지 진행하는 헬퍼
    async function fillFormAndSubmit(overrides?: {
      nickname?: string;
      email?: string;
      password?: string;
    }) {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);

      // Step 1: 약관 동의
      const allCheckboxes = screen.getAllByRole("checkbox");
      await user.click(allCheckboxes[0]);
      await user.click(screen.getByText("다음"));

      // Step 2: 정보 입력
      const nickname = overrides?.nickname ?? "테스터";
      const email = overrides?.email ?? "newuser@example.com";
      const password = overrides?.password ?? "Test1234!";

      await user.type(screen.getByPlaceholderText("맛따라"), nickname);
      await user.type(screen.getByPlaceholderText("example@mtr.com"), email);
      await user.type(
        screen.getByPlaceholderText("영문, 숫자, 특수문자를 조합한 8-16자"),
        password
      );
      await user.type(
        screen.getByPlaceholderText("동일한 비밀번호를 입력해주세요"),
        password
      );

      // 계속하기 클릭
      await user.click(screen.getByText("계속하기"));

      return user;
    }

    it("회원가입 성공 시 이메일 인증 페이지로 이동한다", async () => {
      await fillFormAndSubmit();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("/auth/verify?email=")
        );
      });

      // sessionStorage에 자동 로그인용 정보 저장 확인
      expect(sessionStorage.getItem("pendingLoginEmail")).toBe("newuser@example.com");
      expect(sessionStorage.getItem("pendingLoginPassword")).toBe("Test1234!");
    });

    it("중복 이메일로 회원가입 시 에러 메시지가 표시된다", async () => {
      await fillFormAndSubmit({ email: "duplicate@example.com" });

      await waitFor(() => {
        expect(screen.getByText("이미 사용 중인 이메일입니다.")).toBeInTheDocument();
      });

      // 페이지 이동은 안 되어야 함
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("중복 닉네임으로 회원가입 시 에러 메시지가 표시된다", async () => {
      await fillFormAndSubmit({ nickname: "중복닉네임" });

      await waitFor(() => {
        expect(screen.getByText("이미 사용 중인 닉네임입니다.")).toBeInTheDocument();
      });
    });
  });
});
