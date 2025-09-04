package alt_t.truvel.routeOptimization.daySchedule.dayScheduleDTO.response;

import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.routeOptimization.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.routeOptimization.daySchedule.domain.entity.Schedule;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
public class DayScheduleResponse {
    // DTO 생성자에서 엔티티 객체를 받아서 필터링
    private final List<Schedule> schedules;
    private final Location startLocation;
    private final Location endLocation;
    private final LocalDate date;
    private final LocalTime startTime;
    private final LocalTime finishTime;
    @Builder
    public DayScheduleResponse(DaySchedule daySchedule){
        this.schedules = daySchedule.getSchedules();
        this.startLocation = daySchedule.getStartLocation();
        this.endLocation = daySchedule.getEndLocation();
        this.date = daySchedule.getDate();
        this.startTime = daySchedule.getStartTime();
        this.finishTime = daySchedule.getFinishTime();
    }
}
