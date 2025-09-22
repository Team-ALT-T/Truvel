package alt_t.truvel.routeOptimization.daySchedule.Service;

import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.location.domain.repository.LocationRepository;
import alt_t.truvel.daySchedule.dayScheduleDTO.requset.DayScheduleRequest;
import alt_t.truvel.daySchedule.dayScheduleDTO.response.DayScheduleResponse;
import alt_t.truvel.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.location.PlaceCategory;
import alt_t.truvel.daySchedule.service.DayScheduleService;
import alt_t.truvel.daySchedule.service.ScheduleService;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.NoSuchElementException;

import static alt_t.truvel.routeOptimization.daySchedule.DayScheduleFixture.DAY_SCHEDULE_REQUEST;
import static alt_t.truvel.routeOptimization.daySchedule.DayScheduleFixture.SCHEDULE_REQUEST;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DayScheduleServiceTest {
    @Autowired
    DayScheduleService dayScheduleService;
    @Autowired
    LocationRepository locationRepository;
    @Autowired
    TravelPlanRepository travelPlanRepository;
    @Autowired
    ScheduleService scheduleService;

    TravelPlan TRAVEL_PLAN;
    Location LOCATION1;
    Location LOCATION2;
    Location LOCATION3;

    @BeforeEach
    public void beforeEach(){
        TRAVEL_PLAN = new TravelPlan(null, "한국",
                LocalDate.of(2025, 6, 16),
                LocalDate.of(2025, 6, 25),"인천");
        LOCATION1 = new Location(null, TRAVEL_PLAN,"인천", "address" ,PlaceCategory.CAFE, 39.20207, 126.40009);
        LOCATION2 = new Location(null, TRAVEL_PLAN,"서울", "address", PlaceCategory.RESTAURANT, 30.20207, 121.40009);
        LOCATION3 = new Location(null, TRAVEL_PLAN,"부산", "address", PlaceCategory.CAFE,32.20207, 120.40009);

        travelPlanRepository.save(TRAVEL_PLAN);
        locationRepository.save(LOCATION1);
        locationRepository.save(LOCATION2);
        locationRepository.save(LOCATION3);
    }

    @DisplayName("getOptimization")
    @Test
    @Transactional
    public void getOpt(){

        TravelPlan travelPlan = TRAVEL_PLAN;
        // given
        Location startLocation = locationRepository.findByName(DAY_SCHEDULE_REQUEST.getStartLocation()).orElseThrow(
                ()-> new NoSuchElementException(DAY_SCHEDULE_REQUEST.getStartLocation()+"은 저장되지 않은 장소입니다.")
        );
        Location endLocation = locationRepository.findByName(DAY_SCHEDULE_REQUEST.getEndLocation()).orElseThrow(
                ()-> new NoSuchElementException(DAY_SCHEDULE_REQUEST.getStartLocation()+"은 저장되지 않은 장소입니다.")
        );
        // DaySchedule 객체 생성
        DaySchedule DAY_SCHEDULE = new DaySchedule(1L,
                travelPlan,
                startLocation,
                endLocation,
                DAY_SCHEDULE_REQUEST.getDate(),
                DAY_SCHEDULE_REQUEST.getStartTime(),
                DAY_SCHEDULE_REQUEST.getFinishTime(),
                DAY_SCHEDULE_REQUEST.getDayScheduleMemo(),
                null);

        //when
        DayScheduleResponse dayScheduleResponse1 = dayScheduleService.getOptimizationDaySchedule
                (1L,DAY_SCHEDULE_REQUEST);
        DayScheduleResponse dayScheduleResponse2 = new DayScheduleResponse(DAY_SCHEDULE);

        // then
        assertEquals(dayScheduleResponse1.getSchedules(), dayScheduleResponse2.getSchedules());
    }

    @DisplayName("createDaySchedule")
    @Test
    @Transactional
    public void createDaySchedule(){
        // given
        TravelPlan travelPlan = TRAVEL_PLAN;
        // 사전작업 travel plan 과 location은 이미 저장 되어있을 것임.

        // daySchedule 생성
        Location startLocation = locationRepository.findByName(DAY_SCHEDULE_REQUEST.getStartLocation()).orElseThrow(
                ()-> new NoSuchElementException(DAY_SCHEDULE_REQUEST.getStartLocation()+"은 저장되지 않은 장소입니다.")
        );
        Location endLocation = locationRepository.findByName(DAY_SCHEDULE_REQUEST.getEndLocation()).orElseThrow(
                ()-> new NoSuchElementException(DAY_SCHEDULE_REQUEST.getStartLocation()+"은 저장되지 않은 장소입니다.")
        );
        // DaySchedule 객체 생성
        DaySchedule DAY_SCHEDULE = new DaySchedule(2L,
                travelPlan,
                startLocation,
                endLocation,
                DAY_SCHEDULE_REQUEST.getDate(),
                DAY_SCHEDULE_REQUEST.getStartTime(),
                DAY_SCHEDULE_REQUEST.getFinishTime(),
                DAY_SCHEDULE_REQUEST.getDayScheduleMemo(),
                null);

        // when
        Long actualId = DAY_SCHEDULE.getDay_schedule_id();
        // DB에 저장
        DaySchedule daySchedule2 = dayScheduleService.createDaySchedule(travelPlan, DAY_SCHEDULE_REQUEST);

        // then
        // DB에 제대로 저장 되었는지 확인
        assertEquals(daySchedule2.getDay_schedule_id(), actualId);
    }
    @DisplayName("GetUpdateDaySchedule")
    @Test
    @Transactional
    public void getUpdate(){
        // given
        TravelPlan travelPlan = TRAVEL_PLAN;
        // daySchedule 생성
        Location startLocation = locationRepository.findByName(DAY_SCHEDULE_REQUEST.getStartLocation()).orElseThrow(
                ()-> new NoSuchElementException(DAY_SCHEDULE_REQUEST.getStartLocation()+"은 저장되지 않은 장소입니다.")
        );
        Location endLocation = locationRepository.findByName(DAY_SCHEDULE_REQUEST.getEndLocation()).orElseThrow(
                ()-> new NoSuchElementException(DAY_SCHEDULE_REQUEST.getStartLocation()+"은 저장되지 않은 장소입니다.")
        );

        // DaySchedule 객체 생성
        DaySchedule DAY_SCHEDULE = DaySchedule.of(
                travelPlan,
                DAY_SCHEDULE_REQUEST,
                startLocation,
                endLocation);
        dayScheduleService.saveDaySchedule(DAY_SCHEDULE);
        String actualString = DAY_SCHEDULE.getDayScheduleMemo();
                // when
        dayScheduleService.updateDaySchedule(3L, new DayScheduleRequest(
                "인천",
                "서울",
                LocalDate.now(),
                LocalTime.now(),
                LocalTime.of(20,15,0),
                "change",
                SCHEDULE_REQUEST));

        DaySchedule daySchedule2 = dayScheduleService.getDaySchedule(3L);

        // then
        assertNotEquals(actualString, daySchedule2.getDayScheduleMemo());
    }
}