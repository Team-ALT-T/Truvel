package alt_t.truvel.searchCountryAndCity.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class CountryDto {

    private String korean;
    private String english;

    @JsonCreator
    public CountryDto(
            @JsonProperty("korean") String korean, // JSON 필드 이름과 매핑
            @JsonProperty("english") String english) {
        this.korean = korean;
        this.english = english;
    }

}



