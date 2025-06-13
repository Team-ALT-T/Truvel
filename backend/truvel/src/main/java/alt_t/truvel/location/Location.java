package alt_t.truvel.location;

import alt_t.truvel.travelPlan.TravelPlan;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String place;

    @Column
    private Float latitude;

    @Column
    private Float longitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_plan_id")
    private TravelPlan travelPlan;


    public void setTravelPlan(TravelPlan travelPlan) {
    }
}
