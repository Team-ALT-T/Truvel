import "server-only";

import type { CitySearchResponse, CountrySearchResponse } from "./search";

const REVALIDATE_SECONDS = 3600;

type PublicCitySearchParams = {
  keyword: string;
  countryId?: number;
};

function getServerApiBaseUrl() {
  const baseUrl = process.env.SERVER_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "SERVER_API_BASE_URL is required to prerender /my-trips/popular.",
    );
  }

  return baseUrl.replace(/\/$/, "");
}

async function getPublicLocations<T>(pathname: string): Promise<T> {
  const response = await fetch(`${getServerApiBaseUrl()}${pathname}`, {
    headers: { Accept: "application/json" },
    next: {
      revalidate: REVALIDATE_SECONDS,
      tags: ["locations"],
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.includes("application/json")) {
    throw new Error(
      `Public locations request failed: ${pathname} (${response.status}, ${contentType || "unknown content type"})`,
    );
  }

  return response.json() as Promise<T>;
}

export function getPublicCountries() {
  return getPublicLocations<CountrySearchResponse[]>("/public/countries");
}

export function getPublicCities() {
  return getPublicLocations<CitySearchResponse[]>("/public/cities");
}

export async function searchPublicCities({
  keyword,
  countryId,
}: PublicCitySearchParams) {
  const url = new URL("/public/cities", getServerApiBaseUrl());
  url.searchParams.set("keyword", keyword);
  if (countryId !== undefined) {
    url.searchParams.set("countryId", String(countryId));
  }

  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok || !contentType.includes("application/json")) {
    throw new Error(
      `Public city search failed (${response.status}, ${contentType || "unknown content type"})`,
    );
  }

  return response.json() as Promise<CitySearchResponse[]>;
}
