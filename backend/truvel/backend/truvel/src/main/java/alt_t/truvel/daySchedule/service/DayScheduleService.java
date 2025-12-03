package alt_t.truvel.daySchedule.service;

import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.daySchedule.dayScheduleDTO.requset.DayScheduleRequest;
import alt_t.truvel.daySchedule.dayScheduleDTO.response.DayScheduleResponse;
import alt_t.truvel.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.daySchedule.domain.repository.DayScheduleRepository;
import alt_t.truvel.location.service.LocationService;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DayScheduleService {
    private final DayScheduleRepository dayScheduleRepository;
    private final TravelPlanRepository travelPlanRepository;
    private final LocationService locationService;
    private final ScheduleService scheduleService;

    // Response 객체에서 최적화된 일정을 부르기 위한 함수
    public DayScheduleResponse getOptimizationDaySchedule(Long travel_plan_id, DayScheduleRequest dayScheduleRequest){
        // 컨트롤러에서 받은 요청값들 daySchedule 객체로 변환
        TravelPlan travelPlan = travelPlanRepository.findById(travel_plan_id).orElseThrow(() ->
                new NoSuchElementException("No such travel plan with id: " + travel_plan_id));

        // 일별 일정 생성
        DaySchedule daySchedule = createDaySchedule(travelPlan, dayScheduleRequest);

        // daySchedule에 대한 일정 최적화
        log.debug("Before Optimization: {}", daySchedule.getSchedules());
        daySchedule.updateSchedules(RouteOptimization.optimization(daySchedule.getSchedules(), daySchedule));
        log.debug("After Optimization: {}", daySchedule.getSchedules());
        return new DayScheduleResponse(daySchedule);
    }

    // 실제로 DaySchedule 생성에 사용할 함수
    // 종속되어있는 schedule을 함께 생성함
    public DaySchedule createDaySchedule(TravelPlan travelPlan, DayScheduleRequest dayScheduleRequest){

        // location service에 아래 함수 추가 필요
        Location startLocation = locationService.getLocationByName(dayScheduleRequest.getStartLocation());
        Location endLocation = locationService.getLocationByName(dayScheduleRequest.getEndLocation());

        DaySchedule daySchedule = saveDaySchedule(DaySchedule.of(travelPlan, dayScheduleRequest,startLocation,endLocation));
        scheduleService.createSchedule(daySchedule, dayScheduleRequest.getSchedules());
        return daySchedule;
    }


    // 기본적인 save 함수
    public DaySchedule saveDaySchedule(DaySchedule daySchedule){
        return dayScheduleRepository.save(daySchedule);
    }
    
    // 기본적인 update 함수
    public void updateDaySchedule(Long id, DayScheduleRequest dayScheduleRequest){
        DaySchedule daySchedule = dayScheduleRepository.findById(id).orElseThrow();
        Location startLocation = locationService.getLocationByName(dayScheduleRequest.getStartLocation());
        Location endLocation = locationService.getLocationByName(dayScheduleRequest.getEndLocation());
        daySchedule.update(dayScheduleRequest, startLocation, endLocation);
    }

    // GET 일별 일정
    public DaySchedule getDaySchedule(Long day_schedule_id){
        return dayScheduleRepository.findById(day_schedule_id).orElseThrow(() ->
                new NoSuchElementException("[DayScheduleService] NotFound daySchedule"));
    }

    // DELETE 일별 일정
    public void deleteDaySchedule(Long day_schedule_id){
        DaySchedule daySchedule = dayScheduleRepository.findById(day_schedule_id).orElseThrow(() ->
                new NoSuchElementException("[DayScheduleService] NotFound daySchedule"));
        dayScheduleRepository.delete(daySchedule);
    }
}