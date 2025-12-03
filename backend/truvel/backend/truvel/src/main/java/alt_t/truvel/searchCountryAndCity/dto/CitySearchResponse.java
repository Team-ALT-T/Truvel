package alt_t.truvel.searchCountryAndCity.dto;

import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Getter
@NoArgsConstructor
@Builder
public class CitySearchResponse implements Serializable {
    private Long cityId;
    private Long countryId;
    private String korean;
    private String english;


    public CitySearchResponse(Long cityId, Long countryId, String korean, String english) {
        this.cityId = cityId;
        this.countryId = countryId;
        this.korean = korean;
        this.english = english;
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
                .korean(city.getKorean())
                .english(city.getEnglish())
                .build();
    }
}
