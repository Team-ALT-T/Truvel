import { useQuery } from '@tanstack/react-query';
import { travelQueries } from '../queries/travelQueries';

// 여행 일정 목록 조회 훅
export const useTravelPlans = () => {
  return useQuery(travelQueries.plans());
};

// 여행 일정 단건 조회 훅
export const useTravelPlan = (travelPlanId: number | null) => {
  return useQuery({
    ...travelQueries.plan(travelPlanId),
    enabled: !!travelPlanId,
  });
};

