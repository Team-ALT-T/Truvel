"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import type { CitySearchResponse } from "@/lib/api/search";
import CitySelectionList from "../components/CitySelectionList";
import SelectedCitiesAction from "../components/SelectedCitiesAction";
import type { SelectableCity } from "../types";
import { useSelectedCitiesDraft } from "../useSelectedCitiesDraft";

type SearchResultClientProps = {
  initialKeyword: string;
  initialCountryId?: number;
  initialCities: CitySearchResponse[];
  validationError?: string;
};

export default function SearchResultClient({
  initialKeyword,
  initialCountryId,
  initialCities,
  validationError,
}: SearchResultClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialKeyword);
  const {
    selectedCities,
    selectedCityIds,
    toggleCity,
    clearSelected,
    persistDraft,
    prepareSchedule,
  } = useSelectedCitiesDraft();
  const cities = useMemo<SelectableCity[]>(
    () =>
      initialCities.map((city) => ({
        cityId: city.cityId,
        countryId: city.countryId,
        name: city.korean,
        subtitle: city.english,
        image: "/icons/blank.png",
      })),
    [initialCities],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = query.trim();

    if (!keyword) {
      router.push("/my-trips/popular");
      return;
    }

    persistDraft();
    const params = new URLSearchParams({ keyword });
    if (initialCountryId !== undefined) {
      params.set("countryId", String(initialCountryId));
    }
    router.push(`/my-trips/popular/search?${params.toString()}`);
  };

  return (
    <Page>
      <Inner>
        <Header>
          <BackButton type="button" onClick={() => router.back()}>
            <Image src="/icons/Larrow.png" alt="뒤로" width={20} height={20} />
          </BackButton>
          <SearchForm role="search" onSubmit={handleSubmit}>
            <SearchSubmitButton type="submit" aria-label="검색">
              <Image
                src="/icons/Search_light.png"
                alt=""
                width={18}
                height={18}
              />
            </SearchSubmitButton>
            <SearchInput
              aria-label="여행지 검색어"
              value={query}
              maxLength={50}
              onChange={(event) => setQuery(event.target.value)}
            />
          </SearchForm>
        </Header>

        <Heading data-testid="search-heading">
          <strong>{initialKeyword}</strong> 검색 결과
        </Heading>

        {validationError ? (
          <Message role="alert">{validationError}</Message>
        ) : cities.length > 0 ? (
          <ResultSection data-testid="search-results">
            <ResultCount>{cities.length}개의 도시</ResultCount>
            <CitySelectionList
              cities={cities}
              selectedCityIds={selectedCityIds}
              onSelect={toggleCity}
            />
          </ResultSection>
        ) : (
          <Message>검색 결과가 없습니다.</Message>
        )}

        <SelectedCitiesAction
          cities={selectedCities}
          onToggle={toggleCity}
          onClear={clearSelected}
          onComplete={() => {
            prepareSchedule();
            router.push("/schedule");
          }}
        />
      </Inner>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  background: #faf8f6;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 16px 16px 160px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  display: grid;
  place-items: center;
  padding: 4px;
  border: 0;
  background: transparent;
`;

const SearchForm = styled.form`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid #eee;
  border-radius: 999px;
  background: #fff;
`;

const SearchSubmitButton = styled.button`
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

const SearchInput = styled.input`
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1c1c1c;
  font-size: 14px;
`;

const Heading = styled.h1`
  margin: 28px 4px 12px;
  color: #1c1c1c;
  font-size: 20px;

  strong {
    color: #3295e6;
  }
`;

const ResultSection = styled.section`
  padding: 4px 0;
`;

const ResultCount = styled.p`
  margin: 0 4px 8px;
  color: #777;
  font-size: 12px;
`;

const Message = styled.p`
  padding: 64px 0;
  color: #777;
  text-align: center;
`;
