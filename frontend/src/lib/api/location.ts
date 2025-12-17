import apiClient from '../axios';

// 타입 정의
export interface GooglePlaceResult {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  rating?: number | null;
  reviewCount?: number | null;
  types?: string[] | null;
  photoReference?: string | null;
  openNow?: boolean | null;
}

export type PlaceCategory = 'DEFAULT' | 'CAFE' | 'RESTAURANT' | 'ATTRACTION';

export interface LocationSaveRequest {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  category?: PlaceCategory;
}

export interface LocationResponse {
  locationId: number;
  place: string;
  latitude: number;
  longitude: number;
  address: string;
  category: string;
}

// 장소 검색 API
export const searchPlaces = async (
  query: string, 
  lat?: number, 
  lng?: number
): Promise<GooglePlaceResult[]> => {
  const params: any = { query };
  if (lat !== undefined && lng !== undefined) {
    params.lat = lat;
    params.lng = lng;
  }
  
  const response = await apiClient.get<GooglePlaceResult[]>('/locations/search', { params });
  return response.data;
};

// 장소 저장 API
export const saveLocations = async (locations: LocationSaveRequest[]): Promise<LocationResponse[]> => {
  const response = await apiClient.post<LocationResponse[]>('/locations', locations);
  return response.data;
};

// 장소 목록 조회 API
export const getLocations = async (travelPlanId: number): Promise<LocationResponse[]> => {
  const response = await apiClient.get<LocationResponse[]>(`/locations/getLocations/${travelPlanId}`);
  return response.data;
};

// 장소 삭제 API
export const deleteLocation = async (locationId: number): Promise<string> => {
  const response = await apiClient.delete<string>(`/locations/${locationId}`);
  return response.data;
};

