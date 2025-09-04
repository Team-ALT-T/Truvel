package alt_t.truvel.travelPlan.controller;

import alt_t.truvel.auth.security.UserPrincipal;
import alt_t.truvel.travelPlan.dto.TravelPlanRequest;
import alt_t.truvel.travelPlan.dto.TravelPlanResponse;
import alt_t.truvel.travelPlan.service.TravelPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor // 생성자 주입
@RestController
public class TravelPlanController {

    private final TravelPlanService travelPlanService;


    /**
     * 일정 생성 메서드
     * @param userPrincipal : 인증된 사용자의 객체
     * @param request : 클라이언트의 요청
     * @return : 응답과 함께 201 코드 반환
     */
    @PostMapping("/travels")
    public ResponseEntity<TravelPlanResponse> createTravelPlan(@AuthenticationPrincipal UserPrincipal userPrincipal, @RequestBody TravelPlanRequest request) {
        Long userId = userPrincipal.getId();
        TravelPlanResponse response = travelPlanService.createTravelPlan(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    /**
     * 여행 일정 목록 조회 메서드
     * @param userPrincipal : 인증된 사용자의 객체
     * @return : 여행 일정 목록을 리스트 형태로 반환
     */
    @GetMapping("/travels")
    public ResponseEntity<List<TravelPlanResponse>> getTravelPlans(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getId();

        List<TravelPlanResponse> travelPlans = travelPlanService.getTravelPlans(userId);
        return ResponseEntity.ok(travelPlans);
    }


    /**
     * 여행 일정 단건 조회 메서드
     * @param userPrincipal : 인증된 사용자의 객체
     * @param travelPlanId : 조회하려는 여행 일정의 아이디
     * @return : 여행 일정 단건을 반환
     */
    @GetMapping("/travels/{travelPlanId}")
    public ResponseEntity<TravelPlanResponse> getTravelPlan(@AuthenticationPrincipal UserPrincipal userPrincipal, @PathVariable Long travelPlanId) {
        Long userId = userPrincipal.getId();

        TravelPlanResponse response = travelPlanService.getTravelPlan(travelPlanId);
        return ResponseEntity.ok(response);
    }


}