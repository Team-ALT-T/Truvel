import apiClient from '../axios';

// 타입 정의
export interface CountrySearchResponse {
  countryId: number;
  koreanName: string;
  englishName: string;
}

export interface CitySearchResponse {
  cityId: number;
  countryId: number;
  koreanName: string;
  englishName: string;
}

// 국가 검색 API
export const searchCountries = async (keyword?: string): Promise<CountrySearchResponse[]> => {
  const params = keyword ? { keyword } : {};
  const response = await apiClient.get<CountrySearchResponse[]>('/search/countries', { params });
  return response.data;
};

// 도시 검색 API
export const searchCities = async (countryId?: number, keyword?: string): Promise<CitySearchResponse[]> => {
  const params: any = {};
  if (countryId) params.countryId = countryId;
  if (keyword) params.keyword = keyword;
  
  const response = await apiClient.get<CitySearchResponse[]>('/search/cities', { params });
  return response.data;
};

