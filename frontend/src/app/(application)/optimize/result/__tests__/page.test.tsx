import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";
import { renderWithProviders } from "@/test/test-utils";

// ─── Google Maps 컴포넌트 모킹 ─────────────────────────────
vi.mock("../components/RouteMapComponent", () => ({
  default: (props: any) => (
    <div data-testid="mock-route-map">
      {props.places?.map((p: any, i: number) => (
        <span key={i} data-testid={`map-place-${i}`}>
          {p.name}
        </span>
      ))}
    </div>
  ),
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

import ResultPage from "../page";

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
];

function setupTestStorage() {
  localStorage.setItem("selectedTravelDates", JSON.stringify(TEST_DATES));
  localStorage.setItem("selectedTravelTimes", JSON.stringify(TEST_TRAVEL_TIMES));
  sessionStorage.setItem("selectedPlaces", JSON.stringify(TEST_PLACES));
}

describe("ResultPage (optimize/result)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // ═══════════════════════════════════════════════════════════
  // 기본 렌더링
  // ═══════════════════════════════════════════════════════════

  it("Day 1 헤더가 표시된다", async () => {
    setupTestStorage();
    renderWithProviders(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText("Day 1")).toBeInTheDocument();
    });
  });

  it("Storage 데이터에서 장소가 로드되어 하단 패널에 첫 번째 장소가 표시된다", async () => {
    setupTestStorage();
    renderWithProviders(<ResultPage />);

    // "센소지"가 mock 지도와 하단 패널 두 곳에 표시되므로 getAllByText 사용
    await waitFor(() => {
      expect(screen.getAllByText("센소지").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("Google Maps 대신 mock 컴포넌트가 렌더링된다", async () => {
    setupTestStorage();
    renderWithProviders(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-route-map")).toBeInTheDocument();
    });
  });

  it("장소의 테마(카테고리)가 표시된다", async () => {
    setupTestStorage();
    renderWithProviders(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText(/관광명소/)).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Day 전환
  // ═══════════════════════════════════════════════════════════

  it("'다음 날짜' 버튼 클릭 시 Day 2로 전환된다", async () => {
    setupTestStorage();
    const user = userEvent.setup();
    renderWithProviders(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText("Day 1")).toBeInTheDocument();
    });

    // aria-label로 다음 날짜 버튼 찾기
    const nextBtn = screen.getByLabelText("다음 날짜");
    await user.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText("Day 2")).toBeInTheDocument();
    });
  });

  it("Day 1에서 '이전 날짜' 버튼을 누르면 Day 1에 머문다", async () => {
    setupTestStorage();
    const user = userEvent.setup();
    renderWithProviders(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText("Day 1")).toBeInTheDocument();
    });

    const prevBtn = screen.getByLabelText("이전 날짜");
    await user.click(prevBtn);

    // 여전히 Day 1
    expect(screen.getByText("Day 1")).toBeInTheDocument();
  });

  // ═══════════════════════════════════════════════════════════
  // 네비게이션
  // ═══════════════════════════════════════════════════════════

  it("'다음' 버튼 클릭 시 /optimize/check-result로 이동한다", async () => {
    setupTestStorage();
    const user = userEvent.setup();
    renderWithProviders(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText("다음")).toBeInTheDocument();
    });

    await user.click(screen.getByText("다음"));
    expect(mockPush).toHaveBeenCalledWith("/optimize/check-result");
  });

  // ═══════════════════════════════════════════════════════════
  // Storage 없을 때
  // ═══════════════════════════════════════════════════════════

  it("Storage 데이터가 없으면 장소가 표시되지 않는다", async () => {
    // localStorage/sessionStorage를 비운 채로 렌더링
    renderWithProviders(<ResultPage />);

    // mock-route-map은 존재하지만 장소는 없음
    await waitFor(() => {
      expect(screen.getByTestId("mock-route-map")).toBeInTheDocument();
    });

    // 장소 이름이 없어야 함
    expect(screen.queryByText("센소지")).not.toBeInTheDocument();
    expect(screen.queryByText("도쿄 타워")).not.toBeInTheDocument();
  });
});
