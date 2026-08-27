import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

// ─── Next.js 모킹 ───────────────────────────────────────────
const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
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

import RouteOptimizePage from "../page";

describe("RouteOptimizePage (optimize/route)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 기본 렌더링
  // ═══════════════════════════════════════════════════════════

  describe("기본 렌더링", () => {
    it("'전체 경로 최적화' 제목이 표시된다", () => {
      render(<RouteOptimizePage />);
      expect(screen.getByText("전체 경로 최적화")).toBeInTheDocument();
    });

    it("localStorage에 날짜가 없으면 기본 3일이 표시된다", () => {
      render(<RouteOptimizePage />);
      expect(screen.getByText(/Day 1/)).toBeInTheDocument();
      expect(screen.getByText(/Day 2/)).toBeInTheDocument();
      expect(screen.getByText(/Day 3/)).toBeInTheDocument();
    });

    it("AM/PM 토글이 각 Day마다 표시된다", () => {
      render(<RouteOptimizePage />);
      // 각 Day에 출발/도착 2개씩 AM이 있으므로 최소 3*2=6개
      expect(screen.getAllByText("AM").length).toBeGreaterThanOrEqual(6);
      expect(screen.getAllByText("PM").length).toBeGreaterThanOrEqual(6);
    });

    it("'여행 출발 시간'과 '여행 도착 시간' 라벨이 표시된다", () => {
      render(<RouteOptimizePage />);
      expect(
        screen.getAllByText("여행 출발 시간").length
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByText("여행 도착 시간").length
      ).toBeGreaterThanOrEqual(1);
    });

    it("'다음' 버튼이 표시된다", () => {
      render(<RouteOptimizePage />);
      expect(screen.getByText("다음")).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: localStorage에서 날짜 로드
  // ═══════════════════════════════════════════════════════════

  describe("localStorage 날짜 로드", () => {
    it("localStorage에 2일짜리 날짜가 있으면 Day 2개만 표시된다", () => {
      const dates = [
        new Date("2025-09-01").toISOString(),
        new Date("2025-09-02").toISOString(),
      ];
      localStorage.setItem("selectedTravelDates", JSON.stringify(dates));

      render(<RouteOptimizePage />);
      expect(screen.getByText(/Day 1/)).toBeInTheDocument();
      expect(screen.getByText(/Day 2/)).toBeInTheDocument();
      expect(screen.queryByText(/Day 3/)).not.toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 네비게이션
  // ═══════════════════════════════════════════════════════════

  describe("네비게이션", () => {
    it("뒤로가기 버튼 클릭 시 router.back()이 호출된다", async () => {
      const user = userEvent.setup();
      render(<RouteOptimizePage />);

      const backBtn = screen.getByLabelText("뒤로");
      await user.click(backBtn);

      expect(mockBack).toHaveBeenCalled();
    });

    it("'다음' 버튼 클릭 시 localStorage에 저장하고 /optimize/places로 이동한다", async () => {
      const user = userEvent.setup();
      render(<RouteOptimizePage />);

      await user.click(screen.getByText("다음"));

      expect(mockPush).toHaveBeenCalledWith("/optimize/places");
      const stored = localStorage.getItem("selectedTravelTimes");
      expect(stored).toBeTruthy();
    });
  });
});
