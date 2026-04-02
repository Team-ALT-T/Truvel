import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  saveLocations,
  deleteLocation,
  LocationSaveRequest,
  LocationResponse,
} from '../api/location';
import { locationQueries } from '../queries/locationQueries';

// 장소 검색 훅
export const useSearchPlaces = (
  query: string, 
  lat?: number, 
  lng?: number, 
  enabled: boolean = true
) => {
  return useQuery({
    ...locationQueries.searchPlaces(query, lat, lng),
    enabled: enabled && query.length > 0,
  });
};

// 장소 저장 훅
export const useSaveLocations = (travelPlanId: number | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (locations: LocationSaveRequest[]) => saveLocations(locations),
    onSuccess: () => {
      // 저장된 여행의 장소 목록만 다시 조회한다.
      if (!travelPlanId) {
        queryClient.invalidateQueries({ queryKey: locationQueries.all() });
        return;
      }

      queryClient.invalidateQueries({
        queryKey: locationQueries.locationsByPlan(travelPlanId).queryKey,
      });
    },
  });
};

// 장소 목록 조회 훅
export const useLocations = (travelPlanId: number | null) => {
  return useQuery({
    ...locationQueries.locationsByPlan(travelPlanId),
    enabled: !!travelPlanId,
  });
};

// 장소 삭제 훅
export const useDeleteLocation = (travelPlanId: number | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (locationId: number) => deleteLocation(locationId),
    onMutate: async (locationId: number) => {
      if (!travelPlanId) {
        return undefined;
      }

      const targetQuery = locationQueries.locationsByPlan(travelPlanId);

      await queryClient.cancelQueries({
        queryKey: targetQuery.queryKey,
      });

      const previousLocations = queryClient.getQueryData<LocationResponse[]>(
        targetQuery.queryKey
      );

      queryClient.setQueryData<LocationResponse[]>(
        targetQuery.queryKey,
        (old) => old?.filter((location) => location.locationId !== locationId) ?? old
      );

      return { previousLocations, targetQuery };
    },
    onError: (_error, _locationId, context) => {
      if (!context?.targetQuery || !context.previousLocations) {
        return;
      }

      queryClient.setQueryData(
        context.targetQuery.queryKey,
        context.previousLocations
      );
    },
    onSettled: () => {
      // 낙관적 업데이트 후에도 서버 상태와 최종 동기화를 맞춘다.
      if (!travelPlanId) {
        queryClient.invalidateQueries({ queryKey: locationQueries.all() });
        return;
      }

      queryClient.invalidateQueries({
        queryKey: locationQueries.locationsByPlan(travelPlanId).queryKey,
      });
    },
  });
};

