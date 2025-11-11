package alt_t.truvel.travelPlan;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@AllArgsConstructor
@Getter
public class TravelPlanDraftResponse {

    private String message;
    private Long travel_plan_id;
}
