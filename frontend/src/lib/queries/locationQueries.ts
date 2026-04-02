import { queryOptions } from '@tanstack/react-query';
import { getLocations, searchPlaces } from '../api/location';

export const locationQueries = {
  all: () => ['locations'] as const,

  locationsByPlan: (travelPlanId: number | null) =>
    queryOptions({
      queryKey: [...locationQueries.all(), travelPlanId] as const,
      queryFn: () => {
        if (!travelPlanId) throw new Error('Travel plan ID is required');
        return getLocations(travelPlanId);
      },
      staleTime: 60 * 1000, // 1분
    }),

  searchPlaces: (query: string, lat?: number, lng?: number) =>
    queryOptions({
      queryKey: ['searchPlaces', query, lat, lng] as const,
      queryFn: () => searchPlaces(query, lat, lng),
      staleTime: 30 * 1000, // 30초
    }),
};

