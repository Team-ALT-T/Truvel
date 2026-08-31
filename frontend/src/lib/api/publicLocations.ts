import type { CitySearchResponse } from "./search";

const CLIENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function getPublicCitiesByCountry(countryId: number) {
  const url = new URL("/public/cities", CLIENT_API_BASE_URL);
  url.searchParams.set("countryId", String(countryId));

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`공개 도시 조회에 실패했습니다. (${response.status})`);
  }

  return response.json() as Promise<CitySearchResponse[]>;
}
