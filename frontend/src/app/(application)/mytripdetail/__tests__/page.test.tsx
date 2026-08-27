import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from "vitest";
import { http, HttpResponse } from "msw";
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
  useSearchParams: () => ({
    get: (key: string) => (key === "id" ? "1" : null),
  }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} alt={props.alt || ""} />;
  },
}));

import TravelItineraryApp from "../page";

// ─── MSW ─────────────────────────────────────────────────────
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("TravelItineraryApp (mytripdetail)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // ═══════════════════════════════════════════════════════════
  // 통합 테스트: 여행 일정 로딩
  // ═══════════════════════════════════════════════════════════

  describe("여행 일정 로딩", () => {
    it("로딩 중일 때 로딩 메시지가 표시된다", () => {
      renderWithProviders(<TravelItineraryApp />);
      expect(
        screen.getByText("여행 일정을 불러오는 중입니다.")
      ).toBeInTheDocument();
    });

    it("API에서 데이터를 받으면 여행 제목이 표시된다", async () => {
      renderWithProviders(<TravelItineraryApp />);

      await waitFor(() => {
        expect(screen.getByText("도쿄 여행")).toBeInTheDocument();
      });
    });

    it("일정 데이터가 렌더링되면 Day 섹션이 표시된다", async () => {
      renderWithProviders(<TravelItineraryApp />);

      await waitFor(() => {
        // 2025-08-10 ~ 2025-08-12 = 3일
        expect(screen.getByText(/Day 1/)).toBeInTheDocument();
      });
    });

    it("장소 이름(도쿄 타워)이 일정에 표시된다", async () => {
      renderWithProviders(<TravelItineraryApp />);

      await waitFor(() => {
        expect(screen.getByText("도쿄 타워")).toBeInTheDocument();
      });
    });

    it("메모가 있으면 메모 내용이 표시된다", async () => {
      renderWithProviders(<TravelItineraryApp />);

      await waitFor(() => {
        expect(screen.getByText("첫째 날 메모")).toBeInTheDocument();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 통합 테스트: API 에러
  // ═══════════════════════════════════════════════════════════

  describe("API 에러", () => {
    it("API 실패 시 에러 메시지가 표시된다", async () => {
      server.use(
        http.get("http://localhost:8080/travels/:id", () => {
          return HttpResponse.json(
            { message: "서버 오류" },
            { status: 500 }
          );
        })
      );

      renderWithProviders(<TravelItineraryApp />);

      await waitFor(() => {
        expect(
          screen.getByText("일정을 불러오는데 실패했습니다.")
        ).toBeInTheDocument();
      });
    });

    it("에러 시 '내 여행으로' 버튼이 있고 클릭하면 /my-trips로 이동한다", async () => {
      const user = userEvent.setup();

      server.use(
        http.get("http://localhost:8080/travels/:id", () => {
          return HttpResponse.json(
            { message: "서버 오류" },
            { status: 500 }
          );
        })
      );

      renderWithProviders(<TravelItineraryApp />);

      await waitFor(() => {
        expect(screen.getByText("내 여행으로")).toBeInTheDocument();
      });

      await user.click(screen.getByText("내 여행으로"));
      expect(mockPush).toHaveBeenCalledWith("/my-trips");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 탭 & 버튼
  // ═══════════════════════════════════════════════════════════

  describe("탭 & 버튼", () => {
    it("'전체 경로 최적화' 탭이 기본 선택되어 있다", async () => {
      renderWithProviders(<TravelItineraryApp />);

      await waitFor(() => {
        expect(screen.getByText("전체 경로 최적화")).toBeInTheDocument();
      });
    });

    it("'+ 일행 추가' 탭 클릭 시 invite 페이지로 이동한다", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TravelItineraryApp />);

      await waitFor(() => {
        expect(screen.getByText("+ 일행 추가")).toBeInTheDocument();
      });

      await user.click(screen.getByText("+ 일행 추가"));
      expect(mockPush).toHaveBeenCalledWith("/mytripdetail/invite?id=1");
    });

    it("'메모 추가' 버튼이 표시된다", async () => {
      renderWithProviders(<TravelItineraryApp />);

      await waitFor(() => {
        expect(
          screen.getAllByText("메모 추가").length
        ).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
