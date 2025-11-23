import { useQuery } from '@tanstack/react-query';
import { searchCountries, searchCities, CountrySearchResponse, CitySearchResponse } from '../api/search';

// 국가 검색 훅
export const useCountries = (keyword?: string) => {
  return useQuery({
    queryKey: ['countries', keyword],
    queryFn: () => searchCountries(keyword),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 도시 검색 훅
export const useCities = (countryId?: number, keyword?: string) => {
  return useQuery({
    queryKey: ['cities', countryId, keyword],
    queryFn: () => searchCities(countryId, keyword),
    enabled: true, // 항상 활성화 (countryId와 keyword가 optional이므로)
    staleTime: 5 * 60 * 1000, // 5분
  });
};

