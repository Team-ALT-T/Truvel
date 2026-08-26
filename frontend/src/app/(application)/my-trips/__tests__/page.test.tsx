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
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} alt={props.alt || ""} />;
  },
}));

import MyTripsPage from "../page";

// ─── MSW ─────────────────────────────────────────────────────
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("MyTripsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // ═══════════════════════════════════════════════════════════
  // 통합 테스트: 여행 목록 조회
  // ═══════════════════════════════════════════════════════════

  describe("여행 목록 조회", () => {
    it("로딩 중일 때 로딩 메시지가 표시된다", () => {
      renderWithProviders(<MyTripsPage />);

      expect(screen.getByText("여행 일정을 불러오는 중...")).toBeInTheDocument();
    });

    it("여행 목록이 정상적으로 렌더링된다", async () => {
      renderWithProviders(<MyTripsPage />);

      // 데이터 로딩 후 여행 카드가 표시됨
      await waitFor(() => {
        expect(screen.getByText("도쿄 여행")).toBeInTheDocument();
      });
      expect(screen.getByText("제주 여행")).toBeInTheDocument();
    });

    it("'예정된 여행'과 '지난 여행' 섹션이 구분되어 표시된다", async () => {
      renderWithProviders(<MyTripsPage />);

      await waitFor(() => {
        expect(screen.getByText("예정된 여행")).toBeInTheDocument();
        expect(screen.getByText("지난 여행")).toBeInTheDocument();
      });

      // 도쿄(2025-08-15 종료) → 예정된 여행
      // 제주(2024-12-05 종료) → 지난 여행
      expect(screen.getByText("도쿄 여행")).toBeInTheDocument();
      expect(screen.getByText("제주 여행")).toBeInTheDocument();
    });

    it("여행이 없을 때 빈 메시지가 표시된다", async () => {
      // 빈 배열 응답으로 오버라이드
      server.use(
        http.get("http://localhost:8080/travels", () => {
          return HttpResponse.json([]);
        })
      );

      renderWithProviders(<MyTripsPage />);

      await waitFor(() => {
        expect(screen.getByText("예정된 여행이 없습니다.")).toBeInTheDocument();
        expect(screen.getByText("지난 여행이 없습니다.")).toBeInTheDocument();
      });
    });

    it("API 에러 시 에러 메시지와 여행 등록 버튼이 표시된다", async () => {
      server.use(
        http.get("http://localhost:8080/travels", () => {
          return HttpResponse.json(
            { message: "서버 오류" },
            { status: 500 }
          );
        })
      );

      renderWithProviders(<MyTripsPage />);

      // useTravelPlans 훅이 500 에러를 1회 재시도하므로 타임아웃을 넉넉하게 설정
      await waitFor(
        () => {
          expect(screen.getByText("여행 일정을 불러오는데 실패했습니다.")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
      expect(screen.getByText("여행 등록하기")).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 네비게이션
  // ═══════════════════════════════════════════════════════════

  describe("네비게이션", () => {
    it("'여행 등록하기' 클릭 시 popular 페이지로 이동한다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<MyTripsPage />);

      await waitFor(() => {
        expect(screen.getByText("도쿄 여행")).toBeInTheDocument();
      });

      await user.click(screen.getByText("여행 등록하기"));

      expect(mockPush).toHaveBeenCalledWith("my-trips/popular");
    });

    it("하단 네비게이션 '홈' 클릭 시 /home으로 이동한다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<MyTripsPage />);

      await waitFor(() => {
        expect(screen.getByText("도쿄 여행")).toBeInTheDocument();
      });

      await user.click(screen.getByText("홈"));

      expect(mockPush).toHaveBeenCalledWith("/home");
    });
  });
});
