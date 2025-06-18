package alt_t.truvel.searchCountryAndCity.dto;

import alt_t.truvel.searchCountryAndCity.entity.City;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@Builder
public class CitySearchResponse {
    private Long cityId;
    private Long countryId;
    private String koreanName;
    private String englishName;


    public CitySearchResponse(Long cityId, Long countryId, String koreanName, String englishName) {
        this.cityId = cityId;
        this.countryId = countryId;
        this.koreanName = koreanName;
        this.englishName = englishName;
    }


    /**
     * 도시 검색후 결과물을 담는 메서드
     * @param city : 검색된 도시
     * @return : CitySearchResponse 가공 데이터
     */
    public static CitySearchResponse from(City city) {
        return CitySearchResponse.builder()
                .cityId(city.getId())
                .countryId(city.getCountry().getId())
                .koreanName(city.getKorean())
                .englishName(city.getEnglish())
                .build();
    }
}
