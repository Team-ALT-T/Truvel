import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { searchPublicCities } from "@/lib/api/publicLocations.server";
import SearchResultClient from "./SearchResultClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "여행지 검색 | Truvel",
  robots: {
    index: false,
    follow: true,
  },
};

type SearchPageProps = {
  searchParams: Promise<{
    keyword?: string | string[];
    countryId?: string | string[];
  }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const keyword = (first(params.keyword) ?? "").trim();
  const countryIdValue = first(params.countryId);

  if (!keyword) {
    redirect("/my-trips/popular");
  }

  if ([...keyword].length > 50) {
    return (
      <SearchResultClient
        key={`${keyword}:invalid-length`}
        initialKeyword={keyword}
        initialCities={[]}
        validationError="검색어는 50자 이하로 입력해주세요."
      />
    );
  }

  const parsedCountryId = countryIdValue ? Number(countryIdValue) : undefined;
  if (
    countryIdValue &&
    (!/^[1-9]\d*$/.test(countryIdValue) ||
      !Number.isSafeInteger(parsedCountryId))
  ) {
    return (
      <SearchResultClient
        key={`${keyword}:invalid-country`}
        initialKeyword={keyword}
        initialCities={[]}
        validationError="올바른 국가를 선택해주세요."
      />
    );
  }

  const countryId = parsedCountryId;
  const cities = await searchPublicCities({ keyword, countryId });

  return (
    <SearchResultClient
      key={`${keyword}:${countryId ?? "all"}`}
      initialKeyword={keyword}
      initialCountryId={countryId}
      initialCities={cities}
    />
  );
}
