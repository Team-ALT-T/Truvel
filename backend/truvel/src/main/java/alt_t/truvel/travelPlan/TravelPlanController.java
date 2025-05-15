package alt_t.truvel.travelPlan;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RequiredArgsConstructor // 생성자 주입
@Controller
public class TravelPlanController {

    private final TravelPlanRepository travelPlanRepository;
    private final TravelPlanService travelPlanService;

    @PostMapping("/travels/draft")
    public ResponseEntity<TravelPlanDraftResponse> createTravelPlanDraft(@RequestBody TravelPlanDraftRequest request) {
        TravelPlanDraftResponse response = travelPlanService.createTravelPlanDraft(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/travels/draft/{travel_plan_id}/date")
    public ResponseEntity<TravelPlanDataResponse> updateTravelPlanDate(@PathVariable("travel_plan_id") Long travelPlanId, @RequestBody @Valid TravelPlanDateRequest request) {
        TravelPlanDataResponse response = travelPlanService.saveTravelPlanDate(travelPlanId, request);
        return ResponseEntity.ok(response);
    }
}