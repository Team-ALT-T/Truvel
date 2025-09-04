package alt_t.truvel.searchCountryAndCity.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

/**
 * City 검색 요청 내용을 담는 dto
 */
@Getter
public class CityDto {

    private int countryId;
    private String korean;
    private String english;

    @JsonCreator
    public CityDto(@JsonProperty("countryId") int countryId,
                   @JsonProperty("korean") String korean,
                   @JsonProperty("english") String english) {
        this.countryId = countryId;
        this.korean = korean;
        this.english = english;
    }

}
