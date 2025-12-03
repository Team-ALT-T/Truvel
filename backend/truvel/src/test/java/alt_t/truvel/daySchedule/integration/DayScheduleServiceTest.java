package alt_t.truvel.daySchedule.integration;

import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.auth.user.domain.repository.UserRepository;
import alt_t.truvel.daySchedule.dayScheduleDTO.requset.DayScheduleRequest;
import alt_t.truvel.daySchedule.dayScheduleDTO.requset.ScheduleRequest;
import alt_t.truvel.daySchedule.dayScheduleDTO.response.DayScheduleResponse;
import alt_t.truvel.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.daySchedule.domain.entity.Schedule;
import alt_t.truvel.daySchedule.domain.repository.DayScheduleRepository;
import alt_t.truvel.daySchedule.enums.PreferTime;
import alt_t.truvel.daySchedule.service.DayScheduleService;
import alt_t.truvel.location.PlaceCategory;
import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.location.domain.repository.LocationRepository;
import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class DayScheduleServiceTest {

    @Autowired
    private DayScheduleService dayScheduleService;

    @Autowired
    private DayScheduleRepository dayScheduleRepository;

    @Autowired
    private TravelPlanRepository travelPlanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private CountryRepository countryRepository;

    private TravelPlan travelPlan;
    private Location scheduleLocation; // Added for schedule items
    private Location hangangLocation;
    private DaySchedule daySchedule;

    @BeforeEach
    void setUp() {
        // 테스트 데이터 정리
        dayScheduleRepository.deleteAll();
        travelPlanRepository.deleteAll();
        locationRepository.deleteAll();
        userRepository.deleteAll();
        cityRepository.deleteAll();
        countryRepository.deleteAll();

        // 의존 데이터 생성
        User user = userRepository.save(User.builder().nickname("tester").email("test@test.com").password("pass").build());
        Country country = countryRepository.save(Country.builder().korean("한국").english("Korea").build());
        City city = cityRepository.save(City.builder().korean("서울").english("Seoul").country(country).build());

        scheduleLocation = locationRepository.save(Location.builder().name("코엑스").address("주소3").category(PlaceCategory.ATTRACTION).build()); // New location
        hangangLocation = locationRepository.save(Location.builder().name("한강").address("주소4").category(PlaceCategory.ATTRACTION).build());

        travelPlan = travelPlanRepository.save(TravelPlan.builder()
                .user(user)
                .nationId(country)
                .cityId(city)
                .nationName(country.getKorean())
                .cityName(city.getKorean())
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(2))
                .build());

        DayScheduleRequest dayScheduleRequest = new DayScheduleRequest(
                LocalDate.now(),
                LocalTime.of(9, 0),
                LocalTime.of(18, 0),
                "테스트 메모",
                Collections.emptyList()
        );

        // DaySchedule.of 팩토리 메소드를 사용하여 객체 생성
        daySchedule = dayScheduleRepository.save(DaySchedule.of(travelPlan, dayScheduleRequest));
    }

    @Test
    @DisplayName("경로 최적화 조회")
    void getOptimizationDaySchedule() {
        // given
        // Create a ScheduleRequest for the DayScheduleRequest
        ScheduleRequest scheduleItem1 = new ScheduleRequest(
                "코엑스",
                1,
                PreferTime.Afternoon,
                "코엑스 방문",
                Duration.ofHours(2)
                );
        ScheduleRequest scheduleItem2 = new ScheduleRequest(
                "롯데월드",
                1,
                PreferTime.Morning,
                "롯데월드 방문",
                Duration.ofHours(2)
        );

        ScheduleRequest scheduleItem3 = new ScheduleRequest(
                "한강",
                3,
                PreferTime.Evening,
                "한강 구경",
                Duration.ofHours(1)
        );

        DayScheduleRequest request = new DayScheduleRequest(
                LocalDate.now().plusDays(1),
                LocalTime.of(10, 0),
                LocalTime.of(19, 0),
                "최적화 테스트 스케줄",
                List.of(scheduleItem1, scheduleItem2, scheduleItem3) // Pass the schedule item
        );
        DayScheduleResponse dayScheduleResponse = dayScheduleService.getOptimizationDaySchedule(travelPlan.getId(), request);

        // then
        assertNotNull(dayScheduleResponse);

        // Verify schedules are present and potentially optimized (if RouteOptimization works)
        assertEquals(3, dayScheduleResponse.getSchedules().size()); // Assuming one schedule was added

        // Verify content of each schedule
        Schedule coexSchedule = dayScheduleResponse.getSchedules().stream()
                .filter(s -> s.getLocation().getName().equals("코엑스"))
                .findFirst().orElseThrow(() -> new AssertionError("코엑스 스케줄이 없습니다."));
        assertEquals(scheduleLocation.getLocation_id(), coexSchedule.getLocation().getLocation_id());
        assertEquals(scheduleItem1.getMemo(), coexSchedule.getMemo());
        assertEquals(scheduleItem1.getStayTime(), coexSchedule.getStayTime());

        Schedule lotteWorldSchedule = dayScheduleResponse.getSchedules().stream()
                .filter(s -> s.getLocation().getName().equals("롯데월드"))
                .findFirst().orElseThrow(() -> new AssertionError("롯데월드 스케줄이 없습니다."));
        assertEquals(scheduleItem2.getMemo(), lotteWorldSchedule.getMemo());
        assertEquals(scheduleItem2.getStayTime(), lotteWorldSchedule.getStayTime());

        Schedule hangangSchedule = dayScheduleResponse.getSchedules().stream()
                .filter(s -> s.getLocation().getName().equals("한강"))
                .findFirst().orElseThrow(() -> new AssertionError("한강 스케줄이 없습니다."));
        assertEquals(hangangLocation.getLocation_id(), hangangSchedule.getLocation().getLocation_id());
        assertEquals(scheduleItem3.getMemo(), hangangSchedule.getMemo());
        assertEquals(scheduleItem3.getStayTime(), hangangSchedule.getStayTime());
    }

    @Test
    @DisplayName("DaySchedule 생성")
    void createDaySchedule() {
        // given
        DayScheduleRequest request = new DayScheduleRequest(
                LocalDate.now().plusDays(1),
                LocalTime.of(10, 0),
                LocalTime.of(19, 0),
                "새로운 날짜의 스케줄",
                Collections.emptyList()
        );

        // when
        DaySchedule newDaySchedule = dayScheduleService.createDaySchedule(travelPlan, request);

        // then
        assertNotNull(newDaySchedule);
        assertNotNull(newDaySchedule.getDay_schedule_id());
        assertEquals(travelPlan.getId(), newDaySchedule.getTravelPlan().getId());
        assertEquals(request.getDate(), newDaySchedule.getDate());
        assertEquals(2, dayScheduleRepository.findByTravelPlan(travelPlan).size());
    }
    
    @Test
    @DisplayName("DaySchedule 수정")
    void updateDaySchedule() {
        // given
        DayScheduleRequest updateRequest = new DayScheduleRequest(
                daySchedule.getDate(),
                LocalTime.of(11, 0), // 시간 변경
                LocalTime.of(22, 0), // 시간 변경
                "수정된 메모입니다.", // 메모 변경
                Collections.emptyList()
        );

        // when
        dayScheduleService.updateDaySchedule(daySchedule.getDay_schedule_id(), updateRequest);

        // then
        DaySchedule updatedDaySchedule = dayScheduleRepository.findById(daySchedule.getDay_schedule_id()).orElseThrow();
        assertNotNull(updatedDaySchedule);
        assertEquals("수정된 메모입니다.", updatedDaySchedule.getDayScheduleMemo());
        assertEquals(LocalTime.of(11, 0), updatedDaySchedule.getStartTime());
        assertEquals(LocalTime.of(22, 0), updatedDaySchedule.getFinishTime());
    }

    @Test
    @DisplayName("DaySchedule 단건 조회")
    void getDaySchedule() {
        // when
        DaySchedule foundDaySchedule = dayScheduleService.getDaySchedule(daySchedule.getDay_schedule_id());

        // then
        assertNotNull(foundDaySchedule);
        assertEquals(daySchedule.getDay_schedule_id(), foundDaySchedule.getDay_schedule_id());
        assertEquals(travelPlan.getId(), foundDaySchedule.getTravelPlan().getId());
    }

    @Test
    @DisplayName("DaySchedule 삭제")
    void deleteDaySchedule() {
        // given
        Long dayScheduleId = daySchedule.getDay_schedule_id();

        // when
        dayScheduleService.deleteDaySchedule(dayScheduleId);

        // then
        assertFalse(dayScheduleRepository.findById(dayScheduleId).isPresent());
    }
}