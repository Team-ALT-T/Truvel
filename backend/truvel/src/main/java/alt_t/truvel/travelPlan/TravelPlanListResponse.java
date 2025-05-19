package alt_t.truvel.travelPlan;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class TravelPlanListResponse {
    private String message;
    private List<TravelPlanDto> data;

    public static TravelPlanListResponse of(String message, List<TravelPlanDto> data) {
        return TravelPlanListResponse.builder()
                .message(message)
                .data(data)
                .build();
    }


    // 일정의 간단 정보가 담기는 dto
    @Getter
    @AllArgsConstructor
    @Builder
    public static class TravelPlanDto {
        private Long travelPlanId;
        private String nation;
        private String city;
        private LocalDate startDate;
        private LocalDate finishDate;


        // TravelPlanDto를 변환하는 정적 메서드
        public static TravelPlanDto from(TravelPlan travelPlan) {
            return  TravelPlanDto.builder()
                    .travelPlanId(travelPlan.getId())
                    .nation(travelPlan.getNation())
                    .city(travelPlan.getCity())
                    .startDate(travelPlan.getStartDate())
                    .finishDate(travelPlan.getEndDate())
                    .build();
        }
    }
}
