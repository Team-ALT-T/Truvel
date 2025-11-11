package alt_t.truvel.searchCountryAndCity.dto;

import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Builder
public class CountrySearchResponse {

    private Long countryId;
    private String koreanName;
    private String englishName;


    public CountrySearchResponse(Long countryId, String koreanName, String englishName) {
        this.countryId = countryId;
        this.koreanName = koreanName;
        this.englishName = englishName;
    }


    /**
     * 검색된 국가를 담아내는 정적 메서드
     * @param country : 검색된 국가
     * @return : CountrySearchResponse를 가공
     */
    public static CountrySearchResponse from(Country country) {
        return CountrySearchResponse.builder()
                .countryId(country.getId())
                .koreanName(country.getKorean())
                .englishName(country.getEnglish())
                .build();
    }
}
