package alt_t.truvel.travelPlan;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor // 생성자 주입
@Controller
public class TravelPlanController {

    private final TravelPlanService travelPlanService;


    /**
     * 일정 생성 메서드
     * @param userId : 사용자 아이디
     * @param request : 클라이언트의 요청
     * @return : 응답과 함께 201 코드 반환
     */
    @PostMapping("/travels")
    public ResponseEntity<TravelPlanResponse> createTravelPlan(@RequestParam Long userId , @RequestBody TravelPlanRequest request) {

        TravelPlanResponse response = travelPlanService.createTravelPlan(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    /**
     * 여행 일정 목록 조회 메서드
     * @param userId : 사용자 아이디
     * @return : 여행 일정 목록을 리스트 형태로 반환
     */
    @GetMapping("/travels")
    public ResponseEntity<List<TravelPlanResponse>> getTravelPlans(@RequestParam Long userId) {

        List<TravelPlanResponse> travelPlans = travelPlanService.getTravelPlans(userId);
        return ResponseEntity.ok(travelPlans);
    }


    /**
     * 여행 일정 단건 조회 메서드
     * @param userId : 사용자 아이디
     * @param travelPlanId : 조회하려는 여행 일정의 아이디
     * @return : 여행 일정 단건을 반환
     */
    @GetMapping("/travels/{travelPlanId}")
    public ResponseEntity<TravelPlanResponse> getTravelPlan(@RequestParam Long userId, @PathVariable Long travelPlanId) {

        TravelPlanResponse response = travelPlanService.getTravelPlan(userId, travelPlanId);
        return ResponseEntity.ok(response);
    }


}