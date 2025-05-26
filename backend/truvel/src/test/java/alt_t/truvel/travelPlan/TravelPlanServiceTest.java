package alt_t.truvel.travelPlan;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
//@Transactional
class TravelPlanServiceTest {

    @Autowired
    private TravelPlanService travelPlanService;

    @Autowired
    private TravelPlanRepository travelPlanRepository;

//    @Test
//    @DisplayName("여행 초안 생성 후, 날짜 수정이 정상적으로 동작한다")
//    void createAndUpdateTravelPlanDate() {
//        // 1. 여행 초안 생성
//        TravelPlanDraftRequest draftRequest = TravelPlanDraftRequest.builder()
//                .nation("대한민국")
//                .city("서울")
//                .build();
//
//        TravelPlanDraftResponse draftResponse = travelPlanService.createTravelPlanDraft(draftRequest);
//
//        // 2. 생성된 travel_plan_id로 날짜 수정
//        Long travelPlanId = draftResponse.getTravelPlanId();
//        LocalDate startDate = LocalDate.of(2025, 7, 1);
//        LocalDate endDate = LocalDate.of(2025, 7, 5);
//
//        TravelPlanDateRequest dateRequest = TravelPlanDateRequest.builder()
//                .startDate(startDate)
//                .endDate(endDate)
//                .build();
//
//        TravelPlanDateResponse dateResponse = travelPlanService.saveTravelPlanDate(travelPlanId, dateRequest);
//
//        // 3. 검증
//        assertThat(dateResponse.getMessage()).isEqualTo("여행 날짜 저장 완료");
//        assertThat(dateResponse.getTravelPlanId()).isEqualTo(travelPlanId);
//
//        TravelPlan updatedPlan = travelPlanRepository.findById(travelPlanId).orElseThrow();
//        assertThat(updatedPlan.getStartDate()).isEqualTo(startDate);
//        assertThat(updatedPlan.getEndDate()).isEqualTo(endDate);
//        assertThat(updatedPlan.getNation()).isEqualTo("대한민국");
//        assertThat(updatedPlan.getCity()).isEqualTo("서울");
//    }

    @Test
    @DisplayName("여행 초안 생성과 날짜 저장이 하나의 트랜잭션 내에서 정상 동작한다")
    void createTravelPlanWithDate() {
        // 1. 여행 초안 + 날짜 정보 생성
        TravelPlanDraftRequest draftRequest = TravelPlanDraftRequest.builder()
                .nation("대한민국")
                .city("서울")
                .build();

        LocalDate startDate = LocalDate.of(2025, 7, 1);
        LocalDate endDate = LocalDate.of(2025, 7, 5);

        TravelPlanDateRequest dateRequest = TravelPlanDateRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .build();

        // 2. 통합된 메서드 호출
        TravelPlanDateResponse response = travelPlanService.createTravelPlanWithDate(draftRequest, dateRequest);

        // 3. 검증
        Long travelPlanId = response.getTravelPlanId();

        assertThat(response.getMessage()).isEqualTo("여행 생성 및 날짜 저장 완료");
        assertThat(travelPlanId).isNotNull();

        TravelPlan savedPlan = travelPlanRepository.findById(travelPlanId).orElseThrow();
        assertThat(savedPlan.getNation()).isEqualTo("대한민국");
        assertThat(savedPlan.getCity()).isEqualTo("서울");
        assertThat(savedPlan.getStartDate()).isEqualTo(startDate);
        assertThat(savedPlan.getEndDate()).isEqualTo(endDate);
    }


    @Test
    @DisplayName("여행 일정 목록 조회시 생성한 일정들이 결과로 나온다.")
    void findAllTravelPlans() {
        // given

        // 일정 1
        TravelPlanDraftRequest draftRequest1 = TravelPlanDraftRequest.builder()
                .nation("일본")
                .city("도쿄")
                .build();

        TravelPlanDateRequest dateRequest1 = TravelPlanDateRequest.builder()
                .startDate(LocalDate.of(2025, 7, 1))
                .endDate(LocalDate.of(2025, 7, 5))
                .build();

        travelPlanService.createTravelPlanWithDate(draftRequest1, dateRequest1);

        // 일정 2
        TravelPlanDraftRequest draftRequest2 = TravelPlanDraftRequest.builder()
                .nation("미국")
                .city("샌프란시스코")
                .build();

        TravelPlanDateRequest dateRequest2 = TravelPlanDateRequest.builder()
                .startDate(LocalDate.of(2025, 8, 10))
                .endDate(LocalDate.of(2025, 8, 15))
                .build();

        travelPlanService.createTravelPlanWithDate(draftRequest2, dateRequest2);


        // when
        TravelPlanListResponse response = travelPlanService.findAllTravelPlans();

        // then
        // 1. 생성한 목록 크기 확인
        assertThat(response.getMessage()).isEqualTo("여행 일정 목록 조회 성공");
        assertThat(response.getData()).hasSize(2);

        // 2. 각 여행별 데이터를 잘 불러왔는지 확인
        // 첫 번째 여행 계획 검증
        TravelPlanListResponse.TravelPlanDto firstPlan = response.getData().getFirst();
        assertThat(firstPlan.getNation()).isEqualTo("일본");
        assertThat(firstPlan.getCity()).isEqualTo("도쿄");
        assertThat(firstPlan.getStartDate()).isEqualTo(LocalDate.of(2025, 7, 1));
        assertThat(firstPlan.getFinishDate()).isEqualTo(LocalDate.of(2025, 7, 5));

        // 두 번째 여행 계획 검증
        TravelPlanListResponse.TravelPlanDto secondPlan = response.getData().get(1);
        assertThat(secondPlan.getNation()).isEqualTo("미국");
        assertThat(secondPlan.getCity()).isEqualTo("샌프란시스코");
        assertThat(secondPlan.getStartDate()).isEqualTo(LocalDate.of(2025, 8, 10));
        assertThat(secondPlan.getFinishDate()).isEqualTo(LocalDate.of(2025, 8, 15));

    }


    @Test
    @DisplayName("여행 일정을 기존에 만들지 않은 경우 빈 리스트 반환")
    void findAllTravelPlansX() {
        // given

        // when
        TravelPlanListResponse response = travelPlanService.findAllTravelPlans();

        // then
        assertThat(response.getMessage()).isEqualTo("여행 일정 목록 조회 성공");
        assertThat(response.getData()).isEmpty();
    }

}