import { useQuery } from '@tanstack/react-query';
import { getTravelPlans, getTravelPlan, TravelPlanResponse } from '../api/travel';

// 여행 일정 목록 조회 훅
export const useTravelPlans = () => {
  return useQuery({
    queryKey: ['travelPlans'],
    queryFn: () => getTravelPlans(),
    staleTime: 60 * 1000, // 1분
  });
};

// 여행 일정 단건 조회 훅
export const useTravelPlan = (travelPlanId: number | null) => {
  return useQuery({
    queryKey: ['travelPlan', travelPlanId],
    queryFn: () => {
      if (!travelPlanId) throw new Error('Travel plan ID is required');
      return getTravelPlan(travelPlanId);
    },
    enabled: !!travelPlanId,
    staleTime: 60 * 1000,
  });
};

