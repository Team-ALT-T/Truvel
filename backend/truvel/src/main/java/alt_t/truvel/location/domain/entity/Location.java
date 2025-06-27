package alt_t.truvel.location.domain.entity;

import alt_t.truvel.travelPlan.TravelPlan;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String place;
    private Float latitude;
    private Float longitude;
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_plan_id")
    private TravelPlan travelPlan;

    public void setTravelPlan(TravelPlan travelPlan) {
        this.travelPlan = travelPlan;
    }

    public Location(Long id, String place, Float latitude, Float longitude, String address) {
        this.id = id;
        this.place = place;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
    }


}
