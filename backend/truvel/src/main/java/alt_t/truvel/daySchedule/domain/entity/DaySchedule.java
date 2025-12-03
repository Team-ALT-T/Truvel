package alt_t.truvel.daySchedule.domain.entity;

import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.daySchedule.dayScheduleDTO.requset.DayScheduleRequest;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = PROTECTED)
@Table(name = "day_schedule", indexes = {
        @Index(name = "travel_plan_id_index", columnList = "travel_plan_id")
})

@Setter
public class DaySchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long day_schedule_id;

    // 여행 일정 id 외래키
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "travel_plan_id", nullable = false)
    @JsonBackReference
    private TravelPlan travelPlan;

    @NotNull
    private LocalDate date;
    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime finishTime;

    @NotNull
    private String dayScheduleMemo;  // 일정 메모

    @OneToMany(mappedBy = "daySchedule", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Schedule> schedules;

    // id 입력 x
    public static DaySchedule of(final TravelPlan travelPlan,
                                 final DayScheduleRequest dayScheduleRequest){
        return of(travelPlan, null, dayScheduleRequest);
    }
    // id 입력 o
    public static DaySchedule of(final TravelPlan travelPlan,
                                 Long id,
                                 final DayScheduleRequest dayScheduleRequest){
        return new DaySchedule(id,
                travelPlan,
                dayScheduleRequest.getDate(),
                dayScheduleRequest.getStartTime(),
                dayScheduleRequest.getFinishTime(),
                dayScheduleRequest.getDayScheduleMemo(),
                null);
    }
    public void update(DayScheduleRequest dayScheduleRequest){
        this.date = dayScheduleRequest.getDate();
        this.startTime = dayScheduleRequest.getStartTime();
        this.finishTime = dayScheduleRequest.getFinishTime();
        this.dayScheduleMemo = dayScheduleRequest.getDayScheduleMemo();
    }

    public void updateSchedules(List<Schedule> schedules){
        this.schedules = schedules;
    }

}
