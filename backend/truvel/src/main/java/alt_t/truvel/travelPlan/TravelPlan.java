package alt_t.truvel.travelPlan;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@AllArgsConstructor
@Table(name="TravelPlan")
public class TravelPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String nation;

//    @Column(nullable = false)
    private LocalDate start_date;

//    @Column(nullable = false)
    private LocalDate end_date;

    @Column(nullable = false)
    private String city;

    //--엔티티 관련 메서드--//
    public void updateDates(LocalDate startDate, LocalDate endDate) {
        this.start_date = startDate;
        this.end_date = endDate;
    }

}
