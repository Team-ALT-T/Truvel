"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SelectableCity } from "./types";

export const POPULAR_TRIPS_DRAFT_KEY = "popularTripsSelectedCitiesDraft";

function isSelectableCity(value: unknown): value is SelectableCity {
  if (!value || typeof value !== "object") return false;

  const city = value as Partial<SelectableCity>;
  return (
    typeof city.cityId === "number" &&
    typeof city.countryId === "number" &&
    typeof city.name === "string"
  );
}

function readDraft() {
  try {
    const stored = sessionStorage.getItem(POPULAR_TRIPS_DRAFT_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isSelectableCity) : [];
  } catch {
    sessionStorage.removeItem(POPULAR_TRIPS_DRAFT_KEY);
    return [];
  }
}

function writeDraft(cities: SelectableCity[]) {
  sessionStorage.setItem(POPULAR_TRIPS_DRAFT_KEY, JSON.stringify(cities));
}

export function useSelectedCitiesDraft() {
  const [selectedCities, setSelectedCities] = useState<SelectableCity[]>([]);

  useEffect(() => {
    setSelectedCities(readDraft());
  }, []);

  const selectedCityIds = useMemo(
    () => new Set(selectedCities.map((city) => city.cityId)),
    [selectedCities],
  );

  const toggleCity = useCallback((city: SelectableCity) => {
    setSelectedCities((current) => {
      const exists = current.some(
        (selectedCity) => selectedCity.cityId === city.cityId,
      );
      const next = exists
        ? current.filter((selectedCity) => selectedCity.cityId !== city.cityId)
        : [...current, city];

      writeDraft(next);
      return next;
    });
  }, []);

  const clearSelected = useCallback(() => {
    writeDraft([]);
    setSelectedCities([]);
  }, []);

  const persistDraft = useCallback(() => {
    writeDraft(selectedCities);
  }, [selectedCities]);

  const prepareSchedule = useCallback(() => {
    sessionStorage.setItem(
      "selectedCities",
      JSON.stringify(
        selectedCities.map(({ cityId, countryId, name }) => ({
          cityId,
          countryId,
          name,
        })),
      ),
    );
    sessionStorage.removeItem(POPULAR_TRIPS_DRAFT_KEY);
  }, [selectedCities]);

  return {
    selectedCities,
    selectedCityIds,
    toggleCity,
    clearSelected,
    persistDraft,
    prepareSchedule,
  };
}
