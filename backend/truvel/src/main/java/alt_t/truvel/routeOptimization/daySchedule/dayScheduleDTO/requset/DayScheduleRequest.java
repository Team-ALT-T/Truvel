package alt_t.truvel.routeOptimization.daySchedule.dayScheduleDTO.requset;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class DayScheduleRequest {
    // daySchedule DTO Request
    private String startLocation;
    private String endLocation;
    private LocalDate date;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    @Schema(type = "string", example = "10:30:00", description = "시작 시간 (HH:mm:ss)")
    private LocalTime startTime;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    @Schema(type = "string", example = "18:00:00", description = "종료 시간 (HH:mm:ss)")
    private LocalTime finishTime;
    private String dayScheduleMemo;
    private List<ScheduleRequest> schedules;
}
