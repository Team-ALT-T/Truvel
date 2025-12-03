package alt_t.truvel.daySchedule.dayScheduleDTO.requset;

import alt_t.truvel.daySchedule.enums.PreferTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Duration;

@Getter
@AllArgsConstructor
public class ScheduleRequest {
    private String locationName;
    private Integer scheduleOrder;
    private PreferTime preferTime;
    private String memo;
    @Schema(type = "string", example = "PT30M", description = "체류 시간 (ISO-8601 형식: PT30M = 30분)")
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Duration stayTime;
}
