import { queryOptions } from "@tanstack/react-query";
import { getPublicCitiesByCountry } from "../api/publicLocations";

export const publicLocationQueries = {
  cities: (countryId?: number) =>
    queryOptions({
      queryKey: ["public-cities", countryId] as const,
      queryFn: () => {
        if (countryId === undefined) {
          throw new Error("국가를 선택해주세요.");
        }

        return getPublicCitiesByCountry(countryId);
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),
};
