package alt_t.truvel.travelPlan;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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

}
