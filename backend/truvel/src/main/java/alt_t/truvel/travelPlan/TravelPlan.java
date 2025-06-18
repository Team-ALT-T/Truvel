package alt_t.truvel.travelPlan;

import alt_t.truvel.daySchedule.DaySchedule;
import alt_t.truvel.location.Location;
import alt_t.truvel.searchCountryAndCity.entity.City;
import alt_t.truvel.searchCountryAndCity.entity.Country;
import alt_t.truvel.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name="travel_plan")
public class TravelPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    private Country nation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column
    private LocalDate startDate;

    @Column
    private LocalDate endDate;


    //--연관관계 매핑--//
    @Builder.Default
    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DaySchedule> daySchedules = new ArrayList<>();


    @Builder.Default
    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Location> locations = new ArrayList<>();


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;


    // 생성자
    public TravelPlan(Long id, Country nation, LocalDate startDate, LocalDate endDate, City city) {
        this.id = id;
        this.nation = nation;
        this.city = city;
        this.startDate = startDate;
        this.endDate = endDate;
    }



    //--엔티티 관련 메서드--//

    // 날짜 갱신 메서드
    public void updateDates(LocalDate startDate, LocalDate endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    }


    // 일별 계획 엔티티와 연관관계를 맺는 메서드
    public void addDaySchedule(DaySchedule daySchedule) {
        this.daySchedules.add(daySchedule); // 이후에 DaySchedule 엔티티에 daySchedule.setTravelPlan(...) 메서드 필요
        daySchedule.setTravelPlan(this); // 양방향 설정
    }

    // 일별로 장소를 추가하는 메서드
    public void addLocation(Location location) {
        this.locations.add(location);
        location.setTravelPlan(this);
    }

    // 사용자를 설정하는 메서드
    public void setUser(User user) {
    }




}
