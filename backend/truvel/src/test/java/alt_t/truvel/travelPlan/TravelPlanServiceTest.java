package alt_t.truvel.travelPlan;

import alt_t.truvel.searchCountryAndCity.entity.City;
import alt_t.truvel.searchCountryAndCity.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.entity.Country;
import alt_t.truvel.searchCountryAndCity.repository.CountryRepository;
import alt_t.truvel.user.User;
import alt_t.truvel.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * TravelPlanService의 통합 테스트 - 관련 구현체를 모두 주입받아 진행
 */
@SpringBootTest
@ActiveProfiles("test")
class TravelPlanServiceTest {

    @Autowired private TravelPlanService travelPlanService;
    @Autowired private TravelPlanRepository travelPlanRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CountryRepository countryRepository;
    @Autowired private CityRepository cityRepository;

    // 테스트 코드에서 사용할 필드
    protected User daiseek;
    protected User jaiseek;
    protected TravelPlanRequest request1;
    protected TravelPlanRequest request2;
    protected TravelPlanResponse response1;
    protected TravelPlanResponse response2;

    // 테스트용 국가 및 도시 엔티티
    protected Country korea;
    protected City incheon;
    protected Country japan;
    protected City osaka;


    @BeforeEach
    void setUp() {
        // 데이터 초기화 (테스트 격리)
        userRepository.deleteAllInBatch();
        travelPlanRepository.deleteAllInBatch();
        cityRepository.deleteAllInBatch();
        countryRepository.deleteAllInBatch();

        // 1. 테스트용 국가/도시 데이터 저장 (DataSeeder와 유사)
        korea = new Country("대한민국", "Korea");
        japan = new Country("일본", "Japan");
        countryRepository.saveAll(List.of(korea, japan));

        incheon = new City("인천", "Incheon", korea);
        osaka = new City("오사카", "Osaka", japan);
        cityRepository.saveAll(List.of(incheon, osaka));

        // 2. 사용자 생성
        daiseek = User.builder()
                .email("daiseek@example.com")
                .password("daiseek1234")
                .nickname("daiseek")
                .build();
        userRepository.save(daiseek);

        jaiseek = User.builder()
                .email("jaiseek@example.com")
                .password("jaiseek1234")
                .nickname("jaiseek")
                .build();
        userRepository.save(jaiseek);


        // 3. 여행 일정 생성 후 저장 (TravelPlanRequest DTO 변경 반영)
        request1 = new TravelPlanRequest(
                korea.getId(),      // countryId
                incheon.getId(),    // cityId
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2025, 1, 2)
        );
        response1 = travelPlanService.createTravelPlan(daiseek.getId(), request1);

        request2 = new TravelPlanRequest(
                japan.getId(),      // countryId
                osaka.getId(),      // cityId
                LocalDate.of(2025, 2, 1),
                LocalDate.of(2025, 2, 2)
        );
        response2 = travelPlanService.createTravelPlan(daiseek.getId(), request2);
    }



    @AfterEach
    void tearDown() {
        travelPlanRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        cityRepository.deleteAllInBatch();
        countryRepository.deleteAllInBatch();
    }


    @Test
    @DisplayName("여행 일정이 정상적으로 생성된다.")
    void createTravelPlan() {
        // given
        // 새로운 국가/도시 엔티티를 생성하고 저장 (이 테스트 케이스만을 위한 데이터)
        Country newCountry = countryRepository.save(new Country("독일", "Germany"));
        City newCity = cityRepository.save(new City("베를린", "Berlin", newCountry));

        // TravelPlanRequest 생성 방식 변경: builder() 대신 생성자 직접 호출
        TravelPlanRequest request = new TravelPlanRequest(
                newCountry.getId(), // countryId
                newCity.getId(),    // cityId
                LocalDate.of(2025, 3, 1),
                LocalDate.of(2025, 3, 5));

        // when
        TravelPlanResponse response = travelPlanService.createTravelPlan(daiseek.getId(), request);

        // then
        // 생성된 여행 일정이 DB에 존재하는지 확인
        TravelPlan savedTravelPlan = travelPlanRepository.findById(response.getTravelPlanId())
                .orElseThrow(() -> new IllegalArgumentException("여행 일정이 존재하지 않습니다."));

        assertThat(savedTravelPlan.getNation().getId()).isEqualTo(newCountry.getId());
        assertThat(savedTravelPlan.getCity().getId()).isEqualTo(newCity.getId());
        assertThat(savedTravelPlan.getStartDate()).isEqualTo(request.getStartDate());
        assertThat(savedTravelPlan.getEndDate()).isEqualTo(request.getEndDate());
        assertThat(savedTravelPlan.getUser().getId()).isEqualTo(daiseek.getId());

        // TravelPlanResponse의 내용도 확인
        assertThat(response.getMessage()).isEqualTo("여행 일정이 생성되었습니다");
        assertThat(response.getTravelPlanId()).isEqualTo(savedTravelPlan.getId());
    }


    @Test
    @DisplayName("여행 일정 하나 조회 테스트")
    void getTravelPlan() {
        // given
        TravelPlan savedTravelPlan1 = travelPlanRepository.findById(response1.getTravelPlanId())
                .orElseThrow(() -> new IllegalArgumentException("여행 일정을 찾을 수 없습니다."));

        // when
        TravelPlanResponse testResponse = travelPlanService.getTravelPlan(daiseek.getId(), savedTravelPlan1.getId());

        // then
        assertThat(testResponse.getTravelPlanId()).isEqualTo(response1.getTravelPlanId());



    }
}