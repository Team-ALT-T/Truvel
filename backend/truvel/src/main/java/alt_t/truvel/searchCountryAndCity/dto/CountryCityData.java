package alt_t.truvel.searchCountryAndCity.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.List;

@Getter
public class CountryCityData {

    private List<CountryDto> countries;
    private List<CityDto> cities;

    @JsonCreator
    public CountryCityData(@JsonProperty("countries") List<CountryDto> countries,
                           @JsonProperty("cities") List<CityDto> cities) {
        this.countries = countries;
        this.cities = cities;
    }
}
