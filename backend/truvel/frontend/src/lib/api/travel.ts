import apiClient from '../axios';

// 타입 정의
export interface TravelPlanResponse {
  travelPlanId: number;
  startDate: string; // LocalDate는 ISO 8601 형식으로 전달됨 (예: "2025-05-12")
  endDate: string;
  countryName: string;
  cityName: string;
  message?: string;
  daySchedules?: any[]; // 단건 조회 시에만 포함
}

// 여행 일정 목록 조회 API
export const getTravelPlans = async (): Promise<TravelPlanResponse[]> => {
  const response = await apiClient.get<TravelPlanResponse[]>('/travels');
  return response.data;
};

// 여행 일정 단건 조회 API
export const getTravelPlan = async (travelPlanId: number): Promise<TravelPlanResponse> => {
  const response = await apiClient.get<TravelPlanResponse>(`/travels/${travelPlanId}`);
  return response.data;
};

