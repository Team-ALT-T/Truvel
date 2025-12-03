package alt_t.truvel.travelPlan.controller;

import alt_t.truvel.travelPlan.service.TravelPlanBatchService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/batch/travel-plans")
@RequiredArgsConstructor
@Tag(name = "배치 삭제 작업 테스트용")
public class TravelPlanBatchController {

    private final TravelPlanBatchService travelPlanBatchService;

    @PostMapping("/delete-old")
    public ResponseEntity<String> deleteOldTravelPlans() {
        travelPlanBatchService.deleteOldTravelPlans();
        return ResponseEntity.ok("배치 작업이 성공하였습니다.");
    }
}
