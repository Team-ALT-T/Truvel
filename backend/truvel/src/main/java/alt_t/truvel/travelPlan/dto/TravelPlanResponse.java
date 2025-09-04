package alt_t.truvel.travelPlan.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;


import java.time.LocalDate;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
public class TravelPlanResponse {

    private String message;

    @NotNull
    private Long travelPlanId;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotNull
    private String countryName;

    @NotNull
    private String cityName;


    @Builder
    public TravelPlanResponse(String message, Long travelPlanId,
                              LocalDate startDate, LocalDate endDate,
                              String countryName, String cityName) {
        this.message = message;
        this.travelPlanId = travelPlanId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.countryName = countryName;
        this.cityName = cityName;
    }


    /**
     * 여행 일정 생성시 사용
     * @return : 성공시 응답 메시지, DB에 저장된 여행 일정의 아이디 반환
     */
    public static TravelPlanResponse of(String message, Long travelPlanId) {
        return TravelPlanResponse.builder()
                .message(message)
                .travelPlanId(travelPlanId)
                .build();
    }


    /**
     * 여행 일정 **단건** 조회시 사용
     * @return : DB에서 조회된 데이터를 반환
     */
    public static TravelPlanResponse toTravelPlan(String  message, Long travelPlanId,
                                                  LocalDate startDate, LocalDate endDate,
                                                  String countryName, String cityName) { // 파라미터 이름 변경
        return TravelPlanResponse.builder()
                .message(message)
                .travelPlanId(travelPlanId)
                .startDate(startDate)
                .endDate(endDate)
                .countryName(countryName)
                .cityName(cityName)
                .build();
    }


    /**
     * 여행 일정 목록 조회시 사용
     * @param travelPlanId : DB에 저장된 여행 일정의 아이디
     * @param startDate : 여행 일정 시작날
     * @param endDate : 여행 일정 끝나는 날
     * @param countryName : 여행할 국가
     * @param cityName : 여행할 도시
     * @return : 매개변수들을 묶어서 반환
     */
    public static TravelPlanResponse toTravelPlanList( Long travelPlanId,
                                                       LocalDate startDate, LocalDate endDate,
                                                       String countryName, String cityName) { // 파라미터 이름 변경
        return TravelPlanResponse.builder()
                .travelPlanId(travelPlanId)
                .startDate(startDate)
                .endDate(endDate)
                .countryName(countryName)
                .cityName(cityName)
                .build();
    }

}
