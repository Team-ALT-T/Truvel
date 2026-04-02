import { queryOptions } from '@tanstack/react-query';
import { getTravelPlan, getTravelPlans } from '../api/travel';

export const travelQueries = {
  all: () => ['travel'] as const,

  plans: () =>
    queryOptions({
      queryKey: [...travelQueries.all(), 'plans'] as const,
      queryFn: getTravelPlans,
      staleTime: 60 * 1000, // 1분
    }),

  plan: (travelPlanId: number | null) =>
    queryOptions({
      queryKey: [...travelQueries.all(), 'plan', travelPlanId] as const,
      queryFn: () => {
        if (!travelPlanId) throw new Error('Travel plan ID is required');
        return getTravelPlan(travelPlanId);
      },
      staleTime: 60 * 1000, // 1분
    }),
};
