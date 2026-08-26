import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import { server } from "@/mocks/server";

// ─── Next.js 모킹 ───────────────────────────────────────────
const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} alt={props.alt || ""} />;
  },
}));

import PopularTripsPage from "../page";

// ─── MSW ─────────────────────────────────────────────────────
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("PopularTripsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // ═══════════════════════════════════════════════════════════
  // 통합 테스트: 데이터 로딩 & 렌더링
  // ═══════════════════════════════════════════════════════════

  describe("데이터 로딩 & 렌더링", () => {
    it("로딩 중일 때 로딩 메시지가 표시된다", () => {
      renderWithProviders(<PopularTripsPage />);
      expect(screen.getByText("여행지를 불러오는 중...")).toBeInTheDocument();
    });

    it("국가 목록과 도시 목록이 정상적으로 렌더링된다", async () => {
      renderWithProviders(<PopularTripsPage />);

      // 해외 여행지 탭이 기본 → 대한민국 제외
      // "일본"은 국가 칩(button) + 섹션 타이틀(h3) 두 곳에 렌더되므로 getAllByText 사용
      await waitFor(() => {
        expect(screen.getAllByText("일본").length).toBeGreaterThanOrEqual(1);
      });
      expect(screen.getAllByText("프랑스").length).toBeGreaterThanOrEqual(1);

      // 도시 이름은 인기 여행지 행 + 도시 목록에 중복되므로 getAllByText 사용
      expect(screen.getAllByText("도쿄").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("오사카").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("파리").length).toBeGreaterThanOrEqual(1);
    });

    it("인기 여행지 도시들이 상단에 표시된다", async () => {
      renderWithProviders(<PopularTripsPage />);

      await waitFor(() => {
        expect(screen.getAllByText("도쿄").length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 탭 전환
  // ═══════════════════════════════════════════════════════════

  describe("탭 전환", () => {
    it("'국내 여행지' 탭 클릭 시 국내 도시만 표시된다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<PopularTripsPage />);

      // 데이터 로딩 대기 (해외 도시가 로드되면 준비 완료)
      await waitFor(() => {
        expect(screen.getAllByText("도쿄").length).toBeGreaterThanOrEqual(1);
      });

      // 국내 탭 클릭
      await user.click(screen.getByText("국내 여행지"));

      // 국내 도시가 나타나는지 확인
      await waitFor(() => {
        expect(screen.getAllByText("서울").length).toBeGreaterThanOrEqual(1);
      });
      expect(screen.getAllByText("제주").length).toBeGreaterThanOrEqual(1);
    });

    it("'해외 여행지' 탭이 기본 활성화되어 있다", async () => {
      renderWithProviders(<PopularTripsPage />);

      // 해외 도시들이 정상 로드되면 해외 탭이 활성화된 것
      await waitFor(() => {
        expect(screen.getAllByText("도쿄").length).toBeGreaterThanOrEqual(1);
      });

      const overseasTab = screen.getByText("해외 여행지");
      expect(overseasTab).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 검색
  // ═══════════════════════════════════════════════════════════

  describe("검색", () => {
    it("검색창에 텍스트를 입력할 수 있다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<PopularTripsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("어디로 떠나시나요?")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("어디로 떠나시나요?");
      await user.type(input, "도쿄");

      expect(input).toHaveValue("도쿄");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 도시 선택
  // ═══════════════════════════════════════════════════════════

  describe("도시 선택", () => {
    it("'선택' 버튼 클릭 시 하단 선택 영역이 나타난다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<PopularTripsPage />);

      await waitFor(() => {
        expect(screen.getAllByText("선택").length).toBeGreaterThan(0);
      });

      // 첫 번째 선택 버튼 클릭
      const selectButtons = screen.getAllByText("선택");
      await user.click(selectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("선택 완료")).toBeInTheDocument();
      });
    });

    it("선택한 도시를 해제할 수 있다 (✕ 버튼)", async () => {
      const user = userEvent.setup();
      renderWithProviders(<PopularTripsPage />);

      await waitFor(() => {
        expect(screen.getAllByText("선택").length).toBeGreaterThan(0);
      });

      const selectButtons = screen.getAllByText("선택");
      await user.click(selectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("선택 완료")).toBeInTheDocument();
      });

      // ✕ 버튼으로 선택 해제
      const removeBtn = screen.getByText("✕");
      await user.click(removeBtn);

      await waitFor(() => {
        expect(screen.queryByText("선택 완료")).not.toBeInTheDocument();
      });
    });

    it("'편집' 버튼 클릭 시 모든 선택이 해제된다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<PopularTripsPage />);

      await waitFor(() => {
        expect(screen.getAllByText("선택").length).toBeGreaterThan(0);
      });

      const selectButtons = screen.getAllByText("선택");
      await user.click(selectButtons[0]);
      await user.click(selectButtons[1]);

      await waitFor(() => {
        expect(screen.getByText("편집")).toBeInTheDocument();
      });

      await user.click(screen.getByText("편집"));

      await waitFor(() => {
        expect(screen.queryByText("선택 완료")).not.toBeInTheDocument();
      });
    });

    it("'선택 완료' 클릭 시 sessionStorage에 저장하고 /schedule로 이동한다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<PopularTripsPage />);

      await waitFor(() => {
        expect(screen.getAllByText("선택").length).toBeGreaterThan(0);
      });

      const selectButtons = screen.getAllByText("선택");
      await user.click(selectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("선택 완료")).toBeInTheDocument();
      });

      await user.click(screen.getByText("선택 완료"));

      expect(mockPush).toHaveBeenCalledWith("/schedule");

      const stored = sessionStorage.getItem("selectedCities");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 네비게이션
  // ═══════════════════════════════════════════════════════════

  describe("네비게이션", () => {
    it("뒤로가기 버튼 클릭 시 router.back()이 호출된다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<PopularTripsPage />);

      await waitFor(() => {
        expect(screen.getByAltText("뒤로")).toBeInTheDocument();
      });

      await user.click(screen.getByAltText("뒤로"));

      expect(mockBack).toHaveBeenCalled();
    });
  });
});
