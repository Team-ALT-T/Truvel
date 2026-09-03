import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/test-utils";

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

import SearchResultClient from "../SearchResultClient";

const cities = [
  { cityId: 10, countryId: 1, korean: "도쿄", english: "Tokyo" },
  { cityId: 11, countryId: 1, korean: "도쿄 근교", english: "Tokyo Area" },
];

function renderSearch() {
  return renderWithProviders(
    <SearchResultClient
      initialKeyword="도쿄"
      initialCountryId={1}
      initialCities={cities}
    />,
  );
}

describe("SearchResultClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("서버에서 받은 검색 결과를 브라우저 API 재호출 없이 표시한다", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    renderSearch();

    expect(screen.getByRole("textbox", { name: "여행지 검색어" })).toHaveValue(
      "도쿄",
    );
    expect(screen.getByText("2개의 도시")).toBeInTheDocument();
    expect(screen.getByText("도쿄 근교")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("다시 검색하면 현재 국가 조건을 유지한 URL로 이동한다", async () => {
    const user = userEvent.setup();
    renderSearch();
    const input = screen.getByRole("textbox", { name: "여행지 검색어" });

    await user.clear(input);
    await user.type(input, "오사카");
    await user.keyboard("{Enter}");

    expect(mockPush).toHaveBeenCalledWith(
      "/my-trips/popular/search?keyword=%EC%98%A4%EC%82%AC%EC%B9%B4&countryId=1",
    );
  });

  it("돋보기 버튼을 클릭해도 다시 검색한다", async () => {
    const user = userEvent.setup();
    renderSearch();
    const input = screen.getByRole("textbox", { name: "여행지 검색어" });

    await user.clear(input);
    await user.type(input, "오사카");
    await user.click(screen.getByRole("button", { name: "검색" }));

    expect(mockPush).toHaveBeenCalledWith(
      "/my-trips/popular/search?keyword=%EC%98%A4%EC%82%AC%EC%B9%B4&countryId=1",
    );
  });

  it("기존 draft와 검색 결과에서 추가한 도시를 함께 보존한다", async () => {
    sessionStorage.setItem(
      "popularTripsSelectedCitiesDraft",
      JSON.stringify([{ cityId: 20, countryId: 2, name: "파리" }]),
    );
    const user = userEvent.setup();
    renderSearch();

    await waitFor(() =>
      expect(screen.getByText("선택 완료")).toBeInTheDocument(),
    );
    await user.click(screen.getAllByRole("button", { name: "선택" })[0]);

    const stored = JSON.parse(
      sessionStorage.getItem("popularTripsSelectedCitiesDraft") ?? "[]",
    );
    expect(stored.map((city: { cityId: number }) => city.cityId)).toEqual([
      20, 10,
    ]);
  });

  it("선택 완료 시 schedule payload를 만들고 이동한다", async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.click(screen.getAllByRole("button", { name: "선택" })[0]);
    await user.click(screen.getByRole("button", { name: "선택 완료" }));

    expect(mockPush).toHaveBeenCalledWith("/schedule");
    expect(
      JSON.parse(sessionStorage.getItem("selectedCities") ?? "[]"),
    ).toEqual([{ cityId: 10, countryId: 1, name: "도쿄" }]);
    expect(
      sessionStorage.getItem("popularTripsSelectedCitiesDraft"),
    ).toBeNull();
  });

  it("뒤로가기 버튼은 이전 검색 또는 인기 화면으로 돌아간다", async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.click(screen.getByRole("button", { name: "뒤로" }));

    expect(mockBack).toHaveBeenCalledOnce();
  });
});
