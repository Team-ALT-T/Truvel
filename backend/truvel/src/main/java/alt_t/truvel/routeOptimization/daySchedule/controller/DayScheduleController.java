package alt_t.truvel.routeOptimization.daySchedule.controller;

import alt_t.truvel.location.domain.repository.LocationRepository;
import alt_t.truvel.routeOptimization.daySchedule.service.DayScheduleService;
import alt_t.truvel.routeOptimization.daySchedule.dayScheduleDTO.requset.DayScheduleRequest;
import alt_t.truvel.routeOptimization.daySchedule.dayScheduleDTO.response.DayScheduleResponse;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import alt_t.truvel.travelPlan.service.TravelPlanService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

@RestController
@Getter
@Setter
@RequiredArgsConstructor
@RequestMapping("/travels/{travel_plan_id}/daySchedule")
public class DayScheduleController {
    private final DayScheduleService dayScheduleService;
    private final TravelPlanService travelPlanService;
    private final TravelPlanRepository travelPlanRepository;
    private final LocationRepository locationRepository;

    // 경로 최적화
    // 추천 경로 만들기
    @PostMapping("/optimization")
    public ResponseEntity<DayScheduleResponse> dayScheduleOpt(
            @PathVariable Long travel_plan_id,
            @RequestBody DayScheduleRequest dayScheduleRequest)
    {
        // 테스트를 위한 코드 travelPlan, location 기능과 merge 할 때 삭제

        // 경로 최적화된 일별 일정 받아오기
        DayScheduleResponse dayScheduleResponse = dayScheduleService.getOptimizationDaySchedule(travel_plan_id, dayScheduleRequest);
        return ResponseEntity.ok(dayScheduleResponse);
    }

//    // 일정 등록하기
//    @PostMapping("/enrollSchedule")
//    public ResponseEntity<String> enrollSchedule(){
//        return ResponseEntity.ok("일정 등록이 완료되었습니다.");
//    }
}
