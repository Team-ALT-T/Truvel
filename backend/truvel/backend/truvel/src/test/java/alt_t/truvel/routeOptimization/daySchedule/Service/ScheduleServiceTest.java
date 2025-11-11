package alt_t.truvel.routeOptimization.daySchedule.Service;

import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.location.domain.repository.LocationRepository;
import alt_t.truvel.daySchedule.dayScheduleDTO.requset.DayScheduleRequest;
import alt_t.truvel.daySchedule.dayScheduleDTO.requset.ScheduleRequest;
import alt_t.truvel.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.daySchedule.domain.entity.Schedule;
import alt_t.truvel.daySchedule.domain.repository.DayScheduleRepository;
import alt_t.truvel.location.PlaceCategory;
import alt_t.truvel.daySchedule.service.ScheduleService;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ScheduleServiceTest {
    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private TravelPlanRepository travelPlanRepository;

    @Autowired
    private DayScheduleRepository dayScheduleRepository;

    @Autowired
    private CountryRepository countryRepository;

    Location LOCATION1 = new Location(null,"인천", "address" ,PlaceCategory.CAFE, 39.20207, 126.40009);;
    Location LOCATION2 = new Location(null,"서울", "address", PlaceCategory.RESTAURANT, 30.20207, 121.40009);
    Location LOCATION3 = new Location(null,"부산", "address", PlaceCategory.CAFE,32.20207, 120.40009);

    @BeforeEach
    public void beforeEach(){
    }

    @Test
    void createGet() {
    }
}