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

// ─── Google Maps 컴포넌트 모킹 (jsdom에서 동작 불가) ─────────
vi.mock("../../result/components/RouteMapComponent", () => ({
  default: () => <div data-testid="mock-route-map">Mock Route Map</div>,
}));

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

import CheckResultPage from "../page";

// ─── 테스트용 Storage 데이터 ─────────────────────────────────
const TEST_DATES = [
  new Date("2025-09-01").toISOString(),
  new Date("2025-09-02").toISOString(),
];

const TEST_PLACES = [
  {
    name: "센소지",
    address: "2 Chome-3-1 Asakusa",
    latitude: 35.7148,
    longitude: 139.7967,
    rating: 4.5,
    reviewCount: 1200,
    types: ["tourist_attraction"],
    photoReference: null,
  },
  {
    name: "도쿄 타워",
    address: "4 Chome-2-8 Shibakoen",
    latitude: 35.6586,
    longitude: 139.7454,
    rating: 4.3,
    reviewCount: 800,
    types: ["tourist_attraction"],
    photoReference: null,
  },
];

const TEST_CITIES = [{ cityId: 10, countryId: 1, name: "도쿄" }];

const TEST_TRAVEL_TIMES = [
  {
    date: new Date("2025-09-01").toISOString(),
    startAm: true,
    startHour: 9,
    startMin: 0,
    endAm: false,
    endHour: 6,
    endMin: 0,
  },
  {
    date: new Date("2025-09-02").toISOString(),
    startAm: true,
    startHour: 10,
    startMin: 0,
    endAm: false,
    endHour: 5,
    endMin: 0,
  },
];

function setupTestStorage() {
  localStorage.setItem("selectedTravelDates", JSON.stringify(TEST_DATES));
  localStorage.setItem("selectedTravelTimes", JSON.stringify(TEST_TRAVEL_TIMES));
  sessionStorage.setItem("selectedPlaces", JSON.stringify(TEST_PLACES));
  sessionStorage.setItem("selectedCities", JSON.stringify(TEST_CITIES));
}

// ─── MSW ─────────────────────────────────────────────────────
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("CheckResultPage (optimize/check-result)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    // window.alert 모킹 (jsdom에서는 동작하지만 테스트에서 확인하기 위해)
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 기본 렌더링
  // ═══════════════════════════════════════════════════════════

  describe("기본 렌더링", () => {
    it("Storage 데이터가 있으면 여행 제목이 표시된다", async () => {
      setupTestStorage();
      renderWithProviders(<CheckResultPage />);

      await waitFor(() => {
        expect(screen.getByText("도쿄 여행")).toBeInTheDocument();
      });
    });

    it("장소들이 Day별로 분배되어 표시된다", async () => {
      setupTestStorage();
      renderWithProviders(<CheckResultPage />);

      await waitFor(() => {
        expect(screen.getByText("센소지")).toBeInTheDocument();
        expect(screen.getByText("도쿄 타워")).toBeInTheDocument();
      });
    });

    it("Day 섹션이 날짜 수만큼 표시된다", async () => {
      setupTestStorage();
      renderWithProviders(<CheckResultPage />);

      await waitFor(() => {
        expect(screen.getByText(/Day 1/)).toBeInTheDocument();
        expect(screen.getByText(/Day 2/)).toBeInTheDocument();
      });
    });

    it("'수정하기'와 '일정 등록하기' 버튼이 표시된다", async () => {
      setupTestStorage();
      renderWithProviders(<CheckResultPage />);

      await waitFor(() => {
        expect(screen.getByText("수정하기")).toBeInTheDocument();
        expect(screen.getByText("일정 등록하기")).toBeInTheDocument();
      });
    });

    it("Google Maps 대신 mock 컴포넌트가 렌더링된다", async () => {
      setupTestStorage();
      renderWithProviders(<CheckResultPage />);

      await waitFor(() => {
        expect(screen.getByTestId("mock-route-map")).toBeInTheDocument();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 편집 모드
  // ═══════════════════════════════════════════════════════════

  describe("편집 모드", () => {
    it("'수정하기' 클릭 시 편집 모드로 전환된다", async () => {
      setupTestStorage();
      const user = userEvent.setup();
      renderWithProviders(<CheckResultPage />);

      await waitFor(() => {
        expect(screen.getByText("수정하기")).toBeInTheDocument();
      });

      await user.click(screen.getByText("수정하기"));

      // 편집 모드에서는 '완료' 버튼 2개 (헤더 + 하단)와 '선택 삭제' 버튼이 표시
      await waitFor(() => {
        expect(screen.getByText("선택 삭제")).toBeInTheDocument();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 취소 모달
  // ═══════════════════════════════════════════════════════════

  describe("취소 모달", () => {
    it("'취소' 클릭 시 확인 모달이 표시된다", async () => {
      setupTestStorage();
      const user = userEvent.setup();
      renderWithProviders(<CheckResultPage />);

      await waitFor(() => {
        expect(screen.getByText("취소")).toBeInTheDocument();
      });

      await user.click(screen.getByText("취소"));

      await waitFor(() => {
        expect(
          screen.getByText("모든 내용을 삭제할까요?")
        ).toBeInTheDocument();
      });
    });

    it("모달에서 '확인' 클릭 시 router.back()이 호출된다", async () => {
      setupTestStorage();
      const user = userEvent.setup();
      renderWithProviders(<CheckResultPage />);

      await waitFor(() => {
        expect(screen.getByText("취소")).toBeInTheDocument();
      });

      await user.click(screen.getByText("취소"));

      await waitFor(() => {
        expect(
          screen.getByText("모든 내용을 삭제할까요?")
        ).toBeInTheDocument();
      });

      await user.click(screen.getByText("확인"));
      expect(mockBack).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 통합 테스트: 일정 등록 API
  // ═══════════════════════════════════════════════════════════

  describe("일정 등록 API", () => {
    it("'일정 등록하기' 클릭 시 API 호출 후 성공 alert이 뜨고 /my-trips로 이동한다", async () => {
      setupTestStorage();
      const user = userEvent.setup();
      renderWithProviders(<CheckResultPage />);

      await waitFor(() => {
        expect(screen.getByText("일정 등록하기")).toBeInTheDocument();
      });

      await user.click(screen.getByText("일정 등록하기"));

      // API 호출 완료 후 (MSW가 즉시 응답하므로 "등록 중..."은 순간 표시됨)
      await waitFor(
        () => {
          expect(window.alert).toHaveBeenCalledWith(
            "여행 일정이 등록되었습니다!"
          );
        },
        { timeout: 5000 }
      );

      expect(mockPush).toHaveBeenCalledWith("/my-trips");
    });

    it("API 실패 시 에러 alert이 표시된다", async () => {
      // 여행 계획 생성 API를 실패로 오버라이드
      server.use(
        http.post("http://localhost:8080/travels", () => {
          return HttpResponse.json(
            { message: "서버 오류" },
            { status: 500 }
          );
        })
      );

      setupTestStorage();
      const user = userEvent.setup();
      renderWithProviders(<CheckResultPage />);

      await waitFor(() => {
        expect(screen.getByText("일정 등록하기")).toBeInTheDocument();
      });

      await user.click(screen.getByText("일정 등록하기"));

      await waitFor(
        () => {
          expect(window.alert).toHaveBeenCalled();
          // 에러 메시지가 포함된 alert
          const alertCall = (window.alert as any).mock.calls[0][0] as string;
          expect(alertCall).toContain("실패");
        },
        { timeout: 5000 }
      );
    });
  });
});
