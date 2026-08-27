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
}));

// schedule 페이지의 스타일 모듈 모킹
vi.mock("../stlyes", () => {
  // styled-components를 흉내내는 프록시: 어떤 프로퍼티든 태그를 반환
  const createTag =
    (tag: string) =>
    ({ children, ...rest }: any) => {
      // boolean transient props ($로 시작) 제거
      const filtered: Record<string, any> = {};
      for (const [k, v] of Object.entries(rest)) {
        if (!k.startsWith("$")) filtered[k] = v;
      }
      const el = document.createElement(tag);
      return <div data-testid={tag} {...filtered}>{children}</div>;
    };

  return {
    Container: createTag("Container"),
    Header: createTag("Header"),
    HeaderContent: createTag("HeaderContent"),
    BackButton: ({ children, ...rest }: any) => (
      <button data-testid="back-button" {...rest}>
        {children}
      </button>
    ),
    Title: createTag("Title"),
    Spacer: createTag("Spacer"),
    ScrollableArea: createTag("ScrollableArea"),
    CalendarContainer: createTag("CalendarContainer"),
    MonthSection: createTag("MonthSection"),
    MonthHeader: createTag("MonthHeader"),
    MonthTitle: createTag("MonthTitle"),
    WeekDaysGrid: createTag("WeekDaysGrid"),
    WeekDayCell: createTag("WeekDayCell"),
    WeekDayText: ({ children, ...rest }: any) => {
      const { $dayIndex, ...filtered } = rest;
      return <span {...filtered}>{children}</span>;
    },
    DatesGrid: createTag("DatesGrid"),
    DateButtonStyled: ({ children, onClick, disabled, ...rest }: any) => {
      const { $isSelected, $isWeekend, $isSelectable, ...filtered } = rest;
      return (
        <button
          onClick={onClick}
          disabled={disabled}
          data-selected={$isSelected}
          {...filtered}
        >
          {children}
        </button>
      );
    },
    DateNumber: ({ children }: any) => <span>{children}</span>,
    PulseEffect: () => <span data-testid="pulse" />,
    EmptyCell: () => <div data-testid="empty-cell" />,
    BottomFixedContainer: createTag("BottomFixedContainer"),
    CompleteButton: ({ children, onClick, disabled, ...rest }: any) => {
      const { $hasSelections, ...filtered } = rest;
      return (
        <button onClick={onClick} disabled={disabled} {...filtered}>
          {children}
        </button>
      );
    },
  };
});

import TravelDatePicker from "../page";

describe("TravelDatePicker (schedule)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 기본 렌더링
  // ═══════════════════════════════════════════════════════════

  describe("기본 렌더링", () => {
    it("'여행 날짜 선택' 제목이 표시된다", () => {
      render(<TravelDatePicker />);
      expect(screen.getByText("여행 날짜 선택")).toBeInTheDocument();
    });

    it("날짜를 선택하지 않았을 때 '날짜를 선택해주세요' 버튼이 표시된다", () => {
      render(<TravelDatePicker />);
      expect(screen.getByText("날짜를 선택해주세요")).toBeInTheDocument();
    });

    it("현재 월이 표시된다", () => {
      render(<TravelDatePicker />);
      const now = new Date();
      const monthLabel = `${now.getFullYear()}년 ${String(
        now.getMonth() + 1
      ).padStart(2, "0")}월`;
      expect(screen.getByText(monthLabel)).toBeInTheDocument();
    });

    it("요일 헤더(S M T W T F S)가 표시된다", () => {
      render(<TravelDatePicker />);
      // 요일이 여러 달에 걸쳐 반복 렌더링됨 → getAllByText
      expect(screen.getAllByText("S").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("M").length).toBeGreaterThanOrEqual(1);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 날짜 선택
  // ═══════════════════════════════════════════════════════════

  describe("날짜 선택", () => {
    it("날짜를 클릭하면 '선택 완료' 버튼이 나타난다", async () => {
      const user = userEvent.setup();
      render(<TravelDatePicker />);

      // 현재 월의 15일 클릭 (대부분의 달에 15일이 존재)
      const day15Buttons = screen.getAllByText("15");
      await user.click(day15Buttons[0]);

      expect(screen.getByText("선택 완료")).toBeInTheDocument();
    });

    it("날짜를 선택하지 않으면 하단 버튼이 비활성화된다", () => {
      render(<TravelDatePicker />);
      const btn = screen.getByText("날짜를 선택해주세요");
      expect(btn).toBeDisabled();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 유닛 테스트: 네비게이션
  // ═══════════════════════════════════════════════════════════

  describe("네비게이션", () => {
    it("뒤로가기 버튼 클릭 시 router.back()이 호출된다", async () => {
      const user = userEvent.setup();
      render(<TravelDatePicker />);

      const backBtn = screen.getByTestId("back-button");
      await user.click(backBtn);

      expect(mockBack).toHaveBeenCalled();
    });

    it("날짜 선택 후 '선택 완료' 클릭 시 /my-trips/map으로 이동한다", async () => {
      const user = userEvent.setup();
      render(<TravelDatePicker />);

      // 날짜 선택
      const day15Buttons = screen.getAllByText("15");
      await user.click(day15Buttons[0]);

      // 선택 완료 클릭
      await user.click(screen.getByText("선택 완료"));

      expect(mockPush).toHaveBeenCalledWith("/my-trips/map");
    });

    it("'선택 완료' 클릭 시 localStorage에 날짜가 저장된다", async () => {
      const user = userEvent.setup();
      render(<TravelDatePicker />);

      const day15Buttons = screen.getAllByText("15");
      await user.click(day15Buttons[0]);

      await user.click(screen.getByText("선택 완료"));

      const stored = localStorage.getItem("selectedTravelDates");
      expect(stored).toBeTruthy();
      const dates = JSON.parse(stored!);
      expect(Array.isArray(dates)).toBe(true);
      expect(dates.length).toBeGreaterThan(0);
    });
  });
});
