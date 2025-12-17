import { useQuery } from '@tanstack/react-query';
import { getTravelPlans, getTravelPlan, TravelPlanResponse } from '../api/travel';

// 여행 일정 목록 조회 훅
export const useTravelPlans = () => {
  return useQuery({
    queryKey: ['travelPlans'],
    queryFn: () => getTravelPlans(),
    staleTime: 60 * 1000, // 1분
    retry: (failureCount, error: any) => {
      // 401 에러(인증 실패)나 403 에러는 재시도하지 않음
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // 다른 에러는 최대 1번만 재시도
      return failureCount < 1;
    },
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

