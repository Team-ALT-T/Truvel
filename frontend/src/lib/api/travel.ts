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

export interface TravelPlanRequest {
  cityId: number;
  startDate: string; // ISO 8601 형식 (예: "2025-05-12")
  endDate: string;
}

export interface ScheduleRequest {
  locationName: string;
  scheduleOrder: number;
  preferTime: 'Morning' | 'Afternoon' | 'Evening' | 'Random'; // 백엔드 PreferTime enum 형식에 맞춤
  memo?: string;
  stayTime?: string; // ISO-8601 형식 (예: "PT30M" = 30분)
}

export interface DayScheduleRequest {
  date: string; // ISO 8601 형식 (예: "2025-05-12")
  startTime: string; // HH:mm:ss 형식 (예: "10:30:00")
  finishTime: string; // HH:mm:ss 형식 (예: "18:00:00")
  dayScheduleMemo?: string;
  schedules: ScheduleRequest[];
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

// 여행 계획 생성 API
export const createTravelPlan = async (request: TravelPlanRequest): Promise<TravelPlanResponse> => {
  const response = await apiClient.post<TravelPlanResponse>('/travels', request);
  return response.data;
};

// 일정 생성 API
export const createDaySchedule = async (travelPlanId: number, request: DayScheduleRequest): Promise<string> => {
  const response = await apiClient.post<string>(`/daySchedule/create/${travelPlanId}`, request);
  return response.data;
};

// 일정 수정 API (메모 등)
export const updateDaySchedule = async (dayScheduleId: number, request: DayScheduleRequest): Promise<string> => {
  const response = await apiClient.put<string>(`/daySchedule/update/${dayScheduleId}`, request);
  return response.data;
};
