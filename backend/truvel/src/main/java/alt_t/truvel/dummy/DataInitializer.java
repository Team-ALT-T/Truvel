package alt_t.truvel.dummy;

import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.auth.user.domain.repository.UserRepository;
import alt_t.truvel.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.daySchedule.domain.entity.Schedule;
import alt_t.truvel.daySchedule.domain.repository.DayScheduleRepository;
import alt_t.truvel.daySchedule.domain.repository.ScheduleRepository;
import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.location.domain.repository.LocationRepository;
import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataInitializer {
    // 더미데이터 생성기

    private final TravelPlanRepository travelPlanRepository;
    private final DayScheduleRepository dayScheduleRepository;
    private final ScheduleRepository scheduleRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final CountryRepository countryRepository;
    private final CityRepository cityRepository;

    @Transactional
    public void dummyDataCreation() throws Exception {

        Random random = new Random();

        // 1. 기본 데이터 생성 (User, Country, City, Locations)
        User user = userRepository.save(User.builder().email("testuser@example.com").password("password").nickname("testuser").build());
        Country country = countryRepository.save(Country.builder().korean("대한민국").build());
        City city = cityRepository.save(City.builder().korean("서울").country(country).build());

        List<Location> locations = new ArrayList<>();
        for (int i = 0; i < 200; i++) {
            locations.add(Location.builder()
                    .name("장소 " + (i + 1))
                    .address("주소 " + (i + 1))
                    .latitude(37.5665 + (random.nextDouble() - 0.5))
                    .longitude(126.9780 + (random.nextDouble() - 0.5))
                    .build());
        }
        locationRepository.saveAll(locations);

        // 2. 대량 데이터 생성
        List<TravelPlan> travelPlans = new ArrayList<>();
        List<DaySchedule> daySchedules = new ArrayList<>();
        List<Schedule> schedules = new ArrayList<>();

        for (int i = 0; i < 10; i++) {
            TravelPlan travelPlan = TravelPlan.builder()
                    .title("여행 계획 " + (i + 1))
                    .startDate(LocalDate.now().plusDays(i * 10L))
                    .endDate(LocalDate.now().plusDays(i * 10L + 9))
                    .user(user)
                    .nationId(country)
                    .cityId(city)
                    .nationName(country.getKorean())
                    .cityName(city.getKorean())
                    .build();
            travelPlans.add(travelPlan);

            for (int j = 0; j < 10; j++) {
                DaySchedule daySchedule = DaySchedule.builder()
                        .travelPlan(travelPlan)
                        .date(travelPlan.getStartDate().plusDays(j))
                        .startTime(LocalTime.of(9, 0))
                        .finishTime(LocalTime.of(21, 0))
                        .dayScheduleMemo("하루 메모 " + (j + 1))
                        .build();
                daySchedules.add(daySchedule);

                for (int k = 0; k < 100; k++) {
                    Schedule schedule = Schedule.builder()
                            .daySchedule(daySchedule)
                            .location(locations.get(random.nextInt(locations.size())))
                            .scheduleOrder(k + 1)
                            .memo("세부 일정 메모 " + (k + 1))
                            .build();
                    schedules.add(schedule);
                }
            }
        }

        travelPlanRepository.saveAll(travelPlans);
        dayScheduleRepository.saveAll(daySchedules);
        scheduleRepository.saveAll(schedules);
    }
}
