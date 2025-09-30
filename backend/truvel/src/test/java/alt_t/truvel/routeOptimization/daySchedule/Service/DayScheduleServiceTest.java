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

}