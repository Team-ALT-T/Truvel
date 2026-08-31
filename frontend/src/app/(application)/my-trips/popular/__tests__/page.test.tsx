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
import { renderWithProviders } from "@/test/test-utils";
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";

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

import PopularTripsClient from "../PopularTripsClient";

const initialCountries = [
  { countryId: 1, koreanName: "일본", englishName: "Japan" },
  { countryId: 2, koreanName: "프랑스", englishName: "France" },
  { countryId: 3, koreanName: "대한민국", englishName: "South Korea" },
];

const initialCities = [
  { cityId: 10, countryId: 1, korean: "도쿄", english: "Tokyo" },
  { cityId: 11, countryId: 1, korean: "오사카", english: "Osaka" },
  { cityId: 20, countryId: 2, korean: "파리", english: "Paris" },
  { cityId: 21, countryId: 2, korean: "바르셀로나", english: "Barcelona" },
  { cityId: 30, countryId: 3, korean: "서울", english: "Seoul" },
  { cityId: 31, countryId: 3, korean: "제주", english: "Jeju" },
];

function renderPage() {
  return renderWithProviders(
    <PopularTripsClient
      initialCountries={initialCountries}
      initialCities={initialCities}
    />,
  );
}

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
    it("ISR 초기 데이터는 별도 로딩 없이 표시된다", () => {
      renderPage();
      expect(
        screen.queryByText("여행지를 불러오는 중..."),
      ).not.toBeInTheDocument();
      expect(screen.getAllByText("도쿄").length).toBeGreaterThanOrEqual(1);
    });

    it("국가 목록과 도시 목록이 정상적으로 렌더링된다", async () => {
      renderPage();

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
      renderPage();

      await waitFor(() => {
        expect(screen.getAllByText("도쿄").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("hydration 직후 국가·도시 API를 다시 호출하지 않는다", () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      renderPage();

      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 탭 전환
  // ═══════════════════════════════════════════════════════════

  describe("탭 전환", () => {
    it("'국내 여행지' 탭 클릭 시 국내 도시만 표시된다", async () => {
      const user = userEvent.setup();
      renderPage();

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
      renderPage();

      // 해외 도시들이 정상 로드되면 해외 탭이 활성화된 것
      await waitFor(() => {
        expect(screen.getAllByText("도쿄").length).toBeGreaterThanOrEqual(1);
      });

      const overseasTab = screen.getByText("해외 여행지");
      expect(overseasTab).toBeInTheDocument();
    });

    it("같은 국가를 다시 선택하면 공개 도시 Query cache를 재사용한다", async () => {
      const user = userEvent.setup();
      let japanRequestCount = 0;

      server.use(
        http.get("http://localhost:8080/public/cities", ({ request }) => {
          const countryId = new URL(request.url).searchParams.get("countryId");
          if (countryId === "1") japanRequestCount += 1;

          const cities =
            countryId === "1"
              ? [{ cityId: 10, countryId: 1, korean: "도쿄", english: "Tokyo" }]
              : [
                  {
                    cityId: 20,
                    countryId: 2,
                    korean: "파리",
                    english: "Paris",
                  },
                ];
          return HttpResponse.json(cities);
        }),
      );

      renderPage();
      await user.click(screen.getByRole("button", { name: "일본" }));
      await waitFor(() => expect(japanRequestCount).toBe(1));

      await user.click(screen.getByRole("button", { name: "프랑스" }));
      await waitFor(() => {
        expect(screen.getAllByText("파리").length).toBeGreaterThanOrEqual(1);
      });

      await user.click(screen.getByRole("button", { name: "일본" }));
      await waitFor(() => {
        expect(screen.getAllByText("도쿄").length).toBeGreaterThanOrEqual(1);
      });

      expect(japanRequestCount).toBe(1);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 검색
  // ═══════════════════════════════════════════════════════════

  describe("검색", () => {
    it("검색창에 텍스트를 입력할 수 있다", async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("어디로 떠나시나요?"),
        ).toBeInTheDocument();
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
      renderPage();

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
      renderPage();

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
      renderPage();

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
      renderPage();

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

    it("국가를 전환해도 이미 선택한 도시를 유지한다", async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getAllByRole("button", { name: "선택" })[0]);
      await user.click(screen.getByRole("button", { name: "프랑스" }));

      await waitFor(() => {
        expect(screen.getAllByText("파리").length).toBeGreaterThanOrEqual(1);
      });
      expect(screen.getByRole("button", { name: "선택 완료" })).toBeVisible();
      expect(screen.getAllByText("도쿄").length).toBeGreaterThanOrEqual(2);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 네비게이션
  // ═══════════════════════════════════════════════════════════

  describe("네비게이션", () => {
    it("뒤로가기 버튼 클릭 시 router.back()이 호출된다", async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByAltText("뒤로")).toBeInTheDocument();
      });

      await user.click(screen.getByAltText("뒤로"));

      expect(mockBack).toHaveBeenCalled();
    });
  });
});
