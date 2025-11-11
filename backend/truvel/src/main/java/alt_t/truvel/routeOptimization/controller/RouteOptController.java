package alt_t.truvel.routeOptimization.controller;

import alt_t.truvel.daySchedule.dayScheduleDTO.requset.DayScheduleRequest;
import alt_t.truvel.daySchedule.dayScheduleDTO.response.DayScheduleResponse;
import alt_t.truvel.daySchedule.service.DayScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Getter
@Setter
@RequiredArgsConstructor
@RequestMapping("/route-optimization/{travel_plan_id}")
@Tag(name = "경로 최적화 API", description = "경로 최적화 관련 API")
public class RouteOptController {
    private final DayScheduleService dayScheduleService;
    // 경로 최적화
    // 추천 경로 만들기
    @Operation(summary = "경로 최적화", description = "일별 일정에 대해 경로 최적화를 수행합니다.")
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
}
