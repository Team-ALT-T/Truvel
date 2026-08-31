import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { searchQueries } from "../queries/searchQueries";

// 국가 검색 훅
export const useCountries = (keyword?: string) => {
  return useQuery(searchQueries.countries(keyword));
};

// 도시 검색 훅
export const useCities = (
  countryId?: number,
  keyword?: string,
  enabled = true,
) => {
  // 도시 목록은 "전체 탐색" 화면에서도 사용하므로, 빈 검색어와 countryId 없음도 허용한다.
  return useQuery({
    ...searchQueries.cities(countryId, keyword),
    enabled,
    placeholderData: keepPreviousData,
  });
};
