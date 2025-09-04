package alt_t.truvel.location.domain.entity;

import alt_t.truvel.location.PlaceCategory;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long location_id;

    @ManyToOne
    @JoinColumn(name = "travel_plan_id")
    @JsonBackReference
    private TravelPlan travelPlan;

    @NotNull
    private String name;

    @NotNull
    private String address;

    @NotNull
    private PlaceCategory category;

    @Column
    // 위도
    private double latitude;

    @Column
    // 경도
    private double longitude;

    public void setTravelPlan(TravelPlan travelPlan) {
        this.travelPlan = travelPlan;
    }

}
