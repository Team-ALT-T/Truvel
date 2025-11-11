package alt_t.truvel.travelPlan.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
//@Builder
public class TravelPlanRequest {

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotNull
    private Long countryId;

    @NotNull
    private Long cityId;



    @JsonCreator // JSON <-> Java 객체 변환
    @Builder
//    @JsonProperty : JSON 데이터에서 필드를 가리킴
    public TravelPlanRequest(
            @JsonProperty("countryId") @NotNull Long countryId,
            @JsonProperty("cityId") @NotNull Long cityId,
            @JsonProperty("startDate") @NotNull @FutureOrPresent LocalDate startDate,
            @JsonProperty("endDate") @NotNull @FutureOrPresent LocalDate endDate) {
        this.countryId = countryId;
        this.cityId = cityId;
        this.startDate = startDate;
        this.endDate = endDate;
    }


    /**
     * 여행 일정 생성시 사용
     * @return : TravelPlanRequest으로 가공된 값
     */
    public static TravelPlanRequest toTravelPlan(LocalDate startDate, LocalDate endDate, Long countryId, Long cityId) {
        return TravelPlanRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .countryId(countryId)
                .cityId(cityId)
                .build();
    }
}
