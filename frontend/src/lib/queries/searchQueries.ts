import { queryOptions } from '@tanstack/react-query';
import { searchCountries, searchCities } from '../api/search';

export const searchQueries = {
  countries: (keyword?: string) =>
    queryOptions({
      queryKey: ['countries', keyword] as const,
      queryFn: () => searchCountries(keyword),
      staleTime: 5 * 60 * 1000, // 5분
    }),

  cities: (countryId?: number, keyword?: string) =>
    queryOptions({
      queryKey: ['cities', countryId, keyword] as const,
      queryFn: () => searchCities(countryId, keyword),
      staleTime: 5 * 60 * 1000, // 5분
    }),
};

