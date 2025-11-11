package alt_t.truvel.daySchedule.controller;

import alt_t.truvel.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.location.domain.repository.LocationRepository;
import alt_t.truvel.daySchedule.service.DayScheduleService;
import alt_t.truvel.daySchedule.dayScheduleDTO.requset.DayScheduleRequest;
import alt_t.truvel.daySchedule.dayScheduleDTO.response.DayScheduleResponse;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import alt_t.truvel.travelPlan.dto.TravelPlanResponse;
import alt_t.truvel.travelPlan.service.TravelPlanService;
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
@RequestMapping("/daySchedule")
@Tag(name = "일정 관련 API", description = "일정 컨트롤러")
public class DayScheduleController {
    private final DayScheduleService dayScheduleService;
    private final TravelPlanService travelPlanService;
    private final TravelPlanRepository travelPlanRepository;
    private final LocationRepository locationRepository;

    // 일정 조회하기
    @Operation(summary = "일정 조회", description = "일정 ID로 일정 정보를 조회합니다.")
    @GetMapping("/{daySchedule_id}")
    public ResponseEntity<DayScheduleResponse> getDaySchedule(
            @PathVariable Long daySchedule_id){
        DaySchedule daySchedule = dayScheduleService.getDaySchedule(daySchedule_id);
        return ResponseEntity.ok(new DayScheduleResponse(daySchedule));
    }

    // 일정 등록하기
    @Operation(summary = "일정 등록", description = "특정 여행 계획에 일정을 등록합니다.")
    @PostMapping("/create/{travel_plan_id}")
    public ResponseEntity<String> createDaySchedule(
            @PathVariable Long travel_plan_id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "일정 생성 요청 데이터", required = true)
            @RequestBody DayScheduleRequest dayScheduleRequest)
    {
        TravelPlan travelPlan = travelPlanService.getTravelPlanEntityById(travel_plan_id);
        dayScheduleService.createDaySchedule(travelPlan, dayScheduleRequest);

        return ResponseEntity.ok("일정 등록이 완료되었습니다.");
    }
    // 일정 수정하기
    @Operation(summary = "일정 수정", description = "일정 ID로 일정 정보를 수정합니다.")
    @PutMapping("/update/{daySchedule_id}")
    public ResponseEntity<String> updateDaySchedule(
            @PathVariable Long daySchedule_id,
            @RequestBody DayScheduleRequest dayScheduleRequest)
    {
        dayScheduleService.updateDaySchedule(daySchedule_id, dayScheduleRequest);
        return ResponseEntity.ok("일정 수정이 완료되었습니다.");
    }

    // 일정 삭제하기
    @Operation(summary = "일정 삭제", description = "일정 ID로 일정 정보를 삭제합니다.")
    @DeleteMapping("/delete/{daySchedule_id}")
    public ResponseEntity<String> deleteDaySchedule(
            @PathVariable Long daySchedule_id)
    {
        dayScheduleService.deleteDaySchedule(daySchedule_id);
        return ResponseEntity.ok("일정 삭제가 완료되었습니다.");
    }
}
