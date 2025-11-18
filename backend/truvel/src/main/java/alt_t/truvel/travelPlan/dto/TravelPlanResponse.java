package alt_t.truvel.travelPlan.dto;

import alt_t.truvel.daySchedule.dayScheduleDTO.response.DayScheduleResponse;
import alt_t.truvel.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;


import java.time.LocalDate;
import java.util.List;

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

    @NotNull
    private List<DaySchedule> daySchedules;


    @Builder
    public TravelPlanResponse(String message, Long travelPlanId,
                              LocalDate startDate, LocalDate endDate,
                              String countryName, String cityName, List<DaySchedule> daySchedules) {
        this.message = message;
        this.travelPlanId = travelPlanId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.countryName = countryName;
        this.cityName = cityName;
        this.daySchedules = daySchedules;
    }
    @Builder
    public TravelPlanResponse(String message, TravelPlan travelPlan) {
        this.message = message;
        this.travelPlanId = travelPlan.getId();
        this.startDate = null;
        this.endDate = null;
        this.countryName = null;
        this.cityName = null;
        this.daySchedules = null;
    }

    @Builder
    public TravelPlanResponse(TravelPlan travelPlan){
        this.message = null;
        this.travelPlanId = travelPlan.getId();
        this.startDate = travelPlan.getStartDate();
        this.endDate = travelPlan.getEndDate();
        this.countryName = travelPlan.getNationName();
        this.cityName = travelPlan.getCityName();
        this.daySchedules = travelPlan.getDaySchedules();
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

    public static TravelPlanResponse of(Long travelPlanId) {
        return TravelPlanResponse.builder()
                .travelPlanId(travelPlanId)
                .build();
    }


    /**
     * 여행 일정 **단건** 조회시 사용
     * @return : DB에서 조회된 데이터를 반환
     */
    public static TravelPlanResponse toTravelPlan(String  message, Long travelPlanId,
                                                  LocalDate startDate, LocalDate endDate,
                                                  String countryName, String cityName,
                                                  List<DaySchedule> daySchedules) { // 파라미터 이름 변경
        return TravelPlanResponse.builder()
                .message(message)
                .travelPlanId(travelPlanId)
                .startDate(startDate)
                .endDate(endDate)
                .countryName(countryName)
                .cityName(cityName)
                .daySchedules(daySchedules)
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
