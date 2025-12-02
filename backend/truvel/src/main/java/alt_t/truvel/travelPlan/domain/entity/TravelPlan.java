package alt_t.truvel.travelPlan.domain.entity;

import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.editor.domain.entity.Editor;
import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.auth.user.domain.entity.User;
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
    private Country nationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    private City cityId;

    @Column(name = "city", nullable = false)
    private String cityName;

    @Column(name = "nation", nullable = false)
    private String nationName;

    @Column
    private LocalDate startDate;

    @Column
    private LocalDate endDate;


    //--연관관계 매핑--//
    @Builder.Default
    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DaySchedule> daySchedules = new ArrayList<>();


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Builder.Default
    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Editor> editors = new ArrayList<>();

    // 사용자를 설정하는 메서드
    public void setUser(User user) {
        this.user = user;
    }


}