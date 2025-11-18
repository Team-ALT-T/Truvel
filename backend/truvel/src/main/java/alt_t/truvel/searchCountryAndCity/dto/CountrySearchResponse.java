package alt_t.truvel.searchCountryAndCity.dto;

import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CountrySearchResponse {

    private Long countryId;
    private String koreanName;
    private String englishName;


    public CountrySearchResponse(Country country) {
        this.countryId = country.getId();
        this.koreanName = country.getKorean();
        this.englishName = country.getEnglish();
    }


}
