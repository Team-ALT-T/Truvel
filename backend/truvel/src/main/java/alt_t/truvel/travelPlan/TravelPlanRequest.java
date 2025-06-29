package alt_t.truvel.travelPlan;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class TravelPlanRequest {

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotNull
    private String nation;

    @NotNull
    private String city;



    @Builder
    public TravelPlanRequest(LocalDate startDate, LocalDate endDate, String  nation, String city) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.nation = nation;
        this.city = city;
    }


    /**
     * 여행 일정 생성시 사용
     * @return : TravelPlan으로 가공된 값
     */
    public  TravelPlan toTravelPlan() {
        return TravelPlan.builder()
                .startDate(startDate)
                .endDate(endDate)
                .nation(nation)
                .city(city)
                .build();
    }
}
