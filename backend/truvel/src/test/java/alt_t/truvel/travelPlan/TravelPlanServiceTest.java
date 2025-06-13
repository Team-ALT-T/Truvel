package alt_t.truvel.travelPlan;

import alt_t.truvel.user.User;
import alt_t.truvel.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    // 테스트 코드에서 사용할 필드
    protected User daiseek;
    protected User jaiseek;
    protected TravelPlanRequest request1;
    protected TravelPlanRequest request2;
    protected TravelPlanResponse response1;
    protected TravelPlanResponse response2;


    @BeforeEach
    void setUp() {
        // 사용자 생성
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


        // 여행 일정 생성 후 저장
        TravelPlanRequest request1 = TravelPlanRequest.builder()
                .startDate(LocalDate.of(2025, 1, 1))
                .endDate(LocalDate.of(2025, 1, 2))
                .nation("Korea")
                .city("Incheon")
                .build();
        response1 = travelPlanService.createTravelPlan(daiseek.getId(), request1);

        TravelPlanRequest request2 = TravelPlanRequest.builder()
                .startDate(LocalDate.of(2025, 2, 1))
                .endDate(LocalDate.of(2025, 2, 2))
                .nation("Japan")
                .city("osaka")
                .build();
        response2 = travelPlanService.createTravelPlan(daiseek.getId(), request2);
    }


    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
        travelPlanRepository.deleteAll();
    }


    @Test
    @DisplayName("여행 일정이 생성된다.")
    @Transactional
    void createTravelPlan() {
        // given
        TravelPlanRequest request = TravelPlanRequest.builder()
                .startDate(LocalDate.of(2025, 1, 1))
                .endDate(LocalDate.of(2025, 1, 2))
                .nation("Korea")
                .city("Incheon")
                .build();


        // when
        TravelPlanResponse response = travelPlanService.createTravelPlan(daiseek.getId(), request);

        // then
        TravelPlan savedTravelPlan = travelPlanRepository.findById(response.getTravelPlanId())
                .orElseThrow(() -> new IllegalArgumentException("여행 일정이 존재하지 않습니다."));


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