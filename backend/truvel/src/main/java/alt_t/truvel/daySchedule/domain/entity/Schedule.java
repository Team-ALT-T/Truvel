package alt_t.truvel.daySchedule.domain.entity;

import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.routeOptimization.enums.PreferTime;
import alt_t.truvel.daySchedule.dayScheduleDTO.requset.ScheduleRequest;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Duration;

@Entity
@Getter
@Table(name = "schedule")
@AllArgsConstructor
@NoArgsConstructor
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long schedule_id;

    @ManyToOne
    @JoinColumn(name = "day_schedule_id", nullable = false)
    @JsonBackReference
    private DaySchedule daySchedule;

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    // 우선순위 숫자가 작을수록 높은 우선순위
    @Column(nullable = false)
    private Integer scheduleOrder;

    // 가고싶은 시간대를 아침,점심,저녁,랜덤으로 나누고 입력받음
    private PreferTime preferTime;

    private String memo;

    private Duration stayTime;

    public void updateStayTime(Duration stayTime){
        this.stayTime = stayTime;
    }

    public static Schedule of(DaySchedule daySchedule, ScheduleRequest scheduleRequest, Location location){
        return new Schedule(
                null,
                daySchedule,
                location,
                scheduleRequest.getScheduleOrder(),
                scheduleRequest.getPreferTime(),
                scheduleRequest.getMemo(),
                scheduleRequest.getStayTime()
                );
    }
}
