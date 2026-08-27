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

// ─── Google Maps 컴포넌트 모킹 (dynamic import) ──────────────
vi.mock("next/dynamic", () => ({
  default: () => {
    // dynamic()이 반환하는 컴포넌트를 모킹
    const MockComponent = () => (
      <div data-testid="mock-google-map">Mock Google Map</div>
    );
    MockComponent.displayName = "MockGoogleMapComponent";
    return MockComponent;
  },
}));

// ─── LocationSearchInput 모킹 (Google Places 의존) ──────────
vi.mock("../../../my-trips/map/components/LocationSearchInput", () => ({
  default: ({ onSelect, onClear, onSearchStart }: any) => (
    <div data-testid="mock-search-input">
      <input
        placeholder="장소 검색"
        onChange={() => onSearchStart?.()}
        data-testid="search-input"
      />
      <button
        data-testid="select-place-btn"
        onClick={() =>
          onSelect?.({
            name: "시부야 스크램블",
            address: "1 Chome Shibuya",
            latitude: 35.6595,
            longitude: 139.7004,
            rating: 4.2,
            reviewCount: 500,
            types: ["tourist_attraction"],
            photoReference: null,
          })
        }
      >
        장소 선택
      </button>
      <button data-testid="clear-btn" onClick={() => onClear?.()}>
        초기화
      </button>
    </div>
  ),
}));

// ─── Loading 컴포넌트 모킹 ──────────────────────────────────
vi.mock("../../components/Loading", () => ({
  default: () => <div data-testid="loading">로딩 중...</div>,
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

import PlacesPage from "../page";

// ─── 테스트용 Storage 데이터 ─────────────────────────────────
const TEST_EXISTING_PLACES = [
  {
    name: "센소지",
    address: "2 Chome-3-1 Asakusa",
    latitude: 35.7148,
    longitude: 139.7967,
    rating: 4.5,
    reviewCount: 1200,
    types: ["tourist_attraction"],
    photoReference: null,
    image: "/icons/blank.png",
  },
];

const TEST_CITIES = [{ cityId: 10, countryId: 1, name: "도쿄" }];

function setupTestStorage() {
  sessionStorage.setItem("selectedPlaces", JSON.stringify(TEST_EXISTING_PLACES));
  sessionStorage.setItem("selectedCities", JSON.stringify(TEST_CITIES));
}

describe("PlacesPage (optimize/places)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    localStorage.clear();
    sessionStorage.clear();
  });

  // ═══════════════════════════════════════════════════════════
  // 기본 렌더링
  // ═══════════════════════════════════════════════════════════

  it("헤더에 '가고싶은 장소 추가' 텍스트가 표시된다", async () => {
    renderWithProviders(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText("가고싶은 장소 추가")).toBeInTheDocument();
    });
  });

  it("검색 입력이 표시된다", async () => {
    renderWithProviders(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-search-input")).toBeInTheDocument();
    });
  });

  it("Google Maps 대신 mock 컴포넌트가 렌더링된다", async () => {
    renderWithProviders(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-google-map")).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // sessionStorage에서 기존 장소 로드
  // ═══════════════════════════════════════════════════════════

  it("sessionStorage에 장소가 있으면 기존 장소 목록이 표시된다", async () => {
    setupTestStorage();
    renderWithProviders(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText("장소 1")).toBeInTheDocument();
    });
  });

  it("기존 장소가 있으면 '추천 경로 만들기' 버튼이 표시된다", async () => {
    setupTestStorage();
    renderWithProviders(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText("추천 경로 만들기")).toBeInTheDocument();
    });
  });

  it("장소가 없으면 '추가' 버튼이 표시된다", async () => {
    renderWithProviders(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText("추가")).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 장소 추가/삭제
  // ═══════════════════════════════════════════════════════════

  it("검색에서 장소를 선택하면 목록에 추가된다", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlacesPage />);

    // 장소 선택 버튼 클릭 (모킹된 LocationSearchInput에서)
    await user.click(screen.getByTestId("select-place-btn"));

    await waitFor(() => {
      expect(screen.getByText("장소 1")).toBeInTheDocument();
    });

    // sessionStorage에도 저장되었는지 확인
    const stored = JSON.parse(sessionStorage.getItem("selectedPlaces") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("시부야 스크램블");
  });

  it("삭제 버튼 클릭 시 장소가 제거된다", async () => {
    setupTestStorage();
    const user = userEvent.setup();
    renderWithProviders(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText("장소 1")).toBeInTheDocument();
    });

    // 삭제 버튼(✕) 클릭
    await user.click(screen.getByText("✕"));

    await waitFor(() => {
      expect(screen.queryByText("장소 1")).not.toBeInTheDocument();
    });

    // sessionStorage도 업데이트됨
    const stored = JSON.parse(sessionStorage.getItem("selectedPlaces") || "[]");
    expect(stored).toHaveLength(0);
  });

  // ═══════════════════════════════════════════════════════════
  // 네비게이션
  // ═══════════════════════════════════════════════════════════

  it("'추천 경로 만들기' 클릭 시 로딩 화면이 표시된다", async () => {
    setupTestStorage();
    const user = userEvent.setup();
    renderWithProviders(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText("추천 경로 만들기")).toBeInTheDocument();
    });

    await user.click(screen.getByText("추천 경로 만들기"));

    // 로딩 화면 표시 (setTimeout 내부에서 router.push가 3초 후 호출됨)
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toBeInTheDocument();
    });
  });
});
