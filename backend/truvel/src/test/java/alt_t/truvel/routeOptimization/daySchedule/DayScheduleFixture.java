package alt_t.truvel.routeOptimization.daySchedule;

import alt_t.truvel.routeOptimization.daySchedule.enums.PreferTime;
import alt_t.truvel.routeOptimization.daySchedule.dayScheduleDTO.requset.DayScheduleRequest;
import alt_t.truvel.routeOptimization.daySchedule.dayScheduleDTO.requset.ScheduleRequest;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class DayScheduleFixture {

    // ScheduleRequest 객체 배열 생성 (개별 일정 요청)
    public static List<ScheduleRequest> SCHEDULE_REQUEST = new ArrayList<>();
    static {
        SCHEDULE_REQUEST.add(new ScheduleRequest("인천", 1, PreferTime.Evening, "test", Duration.ofHours(2L)));
    }
    // DayScheduleRequest 객체 생성 (일별일정 요청)
    public static DayScheduleRequest DAY_SCHEDULE_REQUEST = new DayScheduleRequest(
            "인천",
            "부산",
            LocalDate.now(),
            LocalTime.now(),
            LocalTime.of(20,15,0),
            "test",
            SCHEDULE_REQUEST);

//    public static DayScheduleResponse DAY_SCHEDULE_RESPONSE = new DayScheduleResponse(
//
//    );
}
