import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Next.js 모킹 ───────────────────────────────────────────
// 테스트 환경에는 Next.js 라우터가 없으므로 가짜로 대체합니다.
// vi.fn()으로 만들면 나중에 "이 함수가 호출됐는지" 검증할 수 있습니다.

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "id" ? "42" : null),
  }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} alt={props.alt || ""} />;
  },
}));

import InviteCompanionsPage from "../page";

describe("InviteCompanionsPage", () => {
  // 각 테스트 전에 모킹된 함수의 호출 기록을 초기화
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── 테스트 1: 기본 렌더링 ──────────────────────────────────
  it("페이지 타이틀과 기본 요소들이 렌더링된다", () => {
    render(<InviteCompanionsPage />);

    // 헤더 타이틀
    expect(screen.getByText("일행 초대")).toBeInTheDocument();
    // 초대 버튼
    expect(screen.getByText("친구 초대하기")).toBeInTheDocument();
    // 하단 버튼들
    expect(screen.getByText("건너뛰기")).toBeInTheDocument();
    expect(screen.getByText("초대 완료")).toBeInTheDocument();
    // 아직 일행이 없으므로 "나의 일행" 텍스트는 없어야 함
    expect(screen.queryByText(/나의 일행/)).not.toBeInTheDocument();
  });

  // ─── 테스트 2: 모달 열기 ────────────────────────────────────
  it("'친구 초대하기' 클릭 시 모달이 열린다", async () => {
    const user = userEvent.setup();
    render(<InviteCompanionsPage />);

    await user.click(screen.getByText("친구 초대하기"));

    // 모달 내부 요소 확인
    expect(screen.getByPlaceholderText("아이디 입력")).toBeInTheDocument();
    expect(screen.getByText("확인")).toBeInTheDocument();
  });

  // ─── 테스트 3: 모달 닫기 (오버레이 클릭) ────────────────────
  it("모달 외부(오버레이) 클릭 시 모달이 닫힌다", async () => {
    const user = userEvent.setup();
    render(<InviteCompanionsPage />);

    // 모달 열기
    await user.click(screen.getByText("친구 초대하기"));
    expect(screen.getByPlaceholderText("아이디 입력")).toBeInTheDocument();

    // 오버레이(모달 배경) 클릭 → 모달 닫힘
    // 모달 카드 바깥 영역 = Overlay 컴포넌트 자체
    const overlay = screen.getByPlaceholderText("아이디 입력").closest("div")
      ?.parentElement?.parentElement;
    if (overlay) {
      await user.click(overlay);
    }

    // 모달이 닫혔으므로 입력창이 사라져야 함
    await waitFor(() => {
      expect(screen.queryByPlaceholderText("아이디 입력")).not.toBeInTheDocument();
    });
  });

  // ─── 테스트 4: 검색 → 결과 표시 ────────────────────────────
  it("닉네임 입력 후 확인 버튼 클릭 시 검색 결과가 표시된다", async () => {
    const user = userEvent.setup();
    render(<InviteCompanionsPage />);

    // 모달 열기
    await user.click(screen.getByText("친구 초대하기"));

    // 닉네임 입력
    const input = screen.getByPlaceholderText("아이디 입력");
    await user.type(input, "테스트친구");

    // 확인 클릭
    await user.click(screen.getByText("확인"));

    // 검색 결과에 닉네임이 표시되고, "초대" 버튼이 나타남
    expect(screen.getByText("테스트친구")).toBeInTheDocument();
    expect(screen.getByText("초대")).toBeInTheDocument();
  });

  // ─── 테스트 5: Enter 키로 검색 ──────────────────────────────
  it("입력 후 Enter 키를 누르면 검색이 실행된다", async () => {
    const user = userEvent.setup();
    render(<InviteCompanionsPage />);

    await user.click(screen.getByText("친구 초대하기"));

    const input = screen.getByPlaceholderText("아이디 입력");
    await user.type(input, "엔터검색{Enter}");

    // Enter로도 검색 결과가 표시되어야 함
    expect(screen.getByText("엔터검색")).toBeInTheDocument();
    expect(screen.getByText("초대")).toBeInTheDocument();
  });

  // ─── 테스트 6: 초대 → 일행 목록 추가 ───────────────────────
  it("초대하면 일행 목록에 추가되고 카운트가 표시된다", async () => {
    const user = userEvent.setup();
    render(<InviteCompanionsPage />);

    // 첫 번째 친구 초대
    await user.click(screen.getByText("친구 초대하기"));
    await user.type(screen.getByPlaceholderText("아이디 입력"), "친구A");
    await user.click(screen.getByText("확인"));
    await user.click(screen.getByText("초대"));

    // 일행 목록에 추가됨
    expect(screen.getByText("나의 일행 1명")).toBeInTheDocument();
    expect(screen.getByText("친구A")).toBeInTheDocument();
    expect(screen.getByText("대기중")).toBeInTheDocument();

    // 두 번째 친구 초대
    await user.click(screen.getByText("친구 초대하기"));
    await user.type(screen.getByPlaceholderText("아이디 입력"), "친구B");
    await user.click(screen.getByText("확인"));
    await user.click(screen.getByText("초대"));

    // 카운트 증가
    expect(screen.getByText("나의 일행 2명")).toBeInTheDocument();
    expect(screen.getByText("친구B")).toBeInTheDocument();
  });

  // ─── 테스트 7: 빈 검색어로는 검색 안 됨 ────────────────────
  it("빈 검색어로 확인 클릭 시 검색 결과가 표시되지 않는다", async () => {
    const user = userEvent.setup();
    render(<InviteCompanionsPage />);

    await user.click(screen.getByText("친구 초대하기"));

    // 아무것도 입력하지 않고 확인 클릭
    await user.click(screen.getByText("확인"));

    // "초대" 버튼이 나타나지 않아야 함 (검색 결과 없음)
    expect(screen.queryByText("초대")).not.toBeInTheDocument();
  });

  // ─── 테스트 8: 네비게이션 (건너뛰기 / 초대 완료 / 뒤로) ───
  describe("네비게이션", () => {
    it("'건너뛰기' 클릭 시 여행 상세 페이지로 이동한다", async () => {
      const user = userEvent.setup();
      render(<InviteCompanionsPage />);

      await user.click(screen.getByText("건너뛰기"));

      expect(mockPush).toHaveBeenCalledWith("/mytripdetail?id=42");
    });

    it("'초대 완료' 클릭 시 여행 상세 페이지로 이동한다", async () => {
      const user = userEvent.setup();
      render(<InviteCompanionsPage />);

      await user.click(screen.getByText("초대 완료"));

      expect(mockPush).toHaveBeenCalledWith("/mytripdetail?id=42");
    });

    it("뒤로 가기 버튼 클릭 시 여행 상세 페이지로 이동한다", async () => {
      const user = userEvent.setup();
      render(<InviteCompanionsPage />);

      // aria-label="뒤로"인 버튼 클릭
      await user.click(screen.getByLabelText("뒤로"));

      expect(mockPush).toHaveBeenCalledWith("/mytripdetail?id=42");
    });
  });
});
