package alt_t.truvel.daySchedule;

import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.travelPlan.TravelPlan;
import jakarta.persistence.*;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;

/**
 * TravelPlan에 연관관계를 맺기 위한 임시용 엔티티입니다!!
 * 추후에 DaySchedule이 만들어졌을때 제거 해야합니다!!
 *
 */
@Entity
@Getter
public class DaySchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "start_location_id")
    private Location startLocationId;

    @ManyToOne
    @JoinColumn(name = "end_location_id")
    private Location endLocationId;

    @Column
    private LocalDate date;

    @Column
    private LocalTime startTime;

    @Column
    private LocalTime endTime;

    @Column
    private String dayMemo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_plan_id")
    private TravelPlan travelPlan;


    public void setTravelPlan(TravelPlan travelPlan) {

    }
}
