package alt_t.truvel.travelPlan;

import alt_t.truvel.daySchedule.DaySchedule;
import alt_t.truvel.location.Location;
import alt_t.truvel.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name="travel_plan")
public class TravelPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String nation;

    @Column
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    @Column(nullable = false)
    private String city;

    @Builder
    public TravelPlan(Long id, String nation, LocalDate startDate, LocalDate endDate, String city) {
        this.id = id;
        this.nation = nation;
        this.startDate = startDate;
        this.endDate = endDate;
        this.city = city;
    }



    //--엔티티 관련 메서드--//
    public void updateDates(LocalDate startDate, LocalDate endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    }


    //--연관관계 매핑--//
    @OneToMany(mappedBy = "day_schedule_id", cascade = CascadeType.ALL)
    private List<DaySchedule> daySchedules = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;



    //--연관관계 메서드--//

    public void addDaySchedule(DaySchedule daySchedule) {
        this.daySchedules.add(daySchedule); // 이후에 DaySchedule 엔티티에 daySchedule.setTravelPlan(...) 메서드 필요
        daySchedule.setTravelPlan(this); // 양방향 설정
    }


    public void setUser(User user) {
    }


    @OneToMany(mappedBy = "location_id", cascade = CascadeType.ALL)
    private List<Location> locations = new ArrayList<>();

    public void addLocation(Location location) {
        this.locations.add(location);
        location.setTravelPlan(this);
    }
}
