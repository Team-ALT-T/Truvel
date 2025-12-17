import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  searchPlaces, 
  saveLocations, 
  getLocations, 
  deleteLocation,
  LocationSaveRequest,
  GooglePlaceResult,
  LocationResponse
} from '../api/location';

// 장소 검색 훅
export const useSearchPlaces = (
  query: string, 
  lat?: number, 
  lng?: number, 
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['searchPlaces', query, lat, lng],
    queryFn: () => searchPlaces(query, lat, lng),
    enabled: enabled && query.length > 0,
    staleTime: 30 * 1000, // 30초
  });
};

// 장소 저장 훅
export const useSaveLocations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (locations: LocationSaveRequest[]) => saveLocations(locations),
    onSuccess: () => {
      // 저장 성공 시 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

// 장소 목록 조회 훅
export const useLocations = (travelPlanId: number | null) => {
  return useQuery({
    queryKey: ['locations', travelPlanId],
    queryFn: () => {
      if (!travelPlanId) throw new Error('Travel plan ID is required');
      return getLocations(travelPlanId);
    },
    enabled: !!travelPlanId,
    staleTime: 60 * 1000, // 1분
  });
};

// 장소 삭제 훅
export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (locationId: number) => deleteLocation(locationId),
    onSuccess: () => {
      // 삭제 성공 시 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

