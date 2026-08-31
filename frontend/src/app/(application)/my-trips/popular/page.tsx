import PopularTripsClient from "./PopularTripsClient";
import {
  getPublicCities,
  getPublicCountries,
} from "@/lib/api/publicLocations.server";

export const revalidate = 3600;

export default async function PopularTripsPage() {
  const [countries, cities] = await Promise.all([
    getPublicCountries(),
    getPublicCities(),
  ]);

  return (
    <PopularTripsClient initialCountries={countries} initialCities={cities} />
  );
}
