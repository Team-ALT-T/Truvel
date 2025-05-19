package alt_t.truvel.travelPlan;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TravelPlanService {

    private final TravelPlanRepository travelPlanRepository;

    /**
     * 일정 생성 기능을 하나로 통합한 메서드
     * @param draftRequest
     * @param dateRequest
     * @return
     */
    @Transactional
    public TravelPlanDateResponse createTravelPlanWithDate(
            TravelPlanDraftRequest draftRequest,
            TravelPlanDateRequest dateRequest) {

        // 1단계: 초안 생성
        TravelPlan travelPlan = draftRequest.toTravelPlanDraft();
        travelPlanRepository.save(travelPlan);

        // 2단계: 날짜 저장 (영속성 컨텍스트 유지됨)
        travelPlan.updateDates(dateRequest.getStartDate(), dateRequest.getEndDate());

        return new TravelPlanDateResponse("여행 생성 및 날짜 저장 완료", travelPlan.getId());
    }


    /**
     * 일정 생성 - 국가/도시 메서드
     * @param request
     * @return
     */
    public TravelPlanDraftResponse createTravelPlanDraft(TravelPlanDraftRequest request) {

         // TravelPlan 엔티티 생성 - request 객체의 변환 메소드 활용
        TravelPlan travelPlanDraft = request.toTravelPlanDraft();
    
        TravelPlan savedTravelPlan = travelPlanRepository.save(travelPlanDraft);

        return new TravelPlanDraftResponse("여행 초안 생성 완료", savedTravelPlan.getId()); // 응답 DTO 반환

    }

    /**
     * 일정 생성 - 날짜 주입 메서드
     * @param travelPlanId
     * @param request
     * @return
     */
    public TravelPlanDateResponse saveTravelPlanDate(Long travelPlanId, TravelPlanDateRequest request) {
        // 기존 여행 계획 조회
        TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId)
                .orElseThrow(() -> new NoSuchElementException("해당 여행 계획페이지가 없습니다."));

        // 날짜 업데이트
        travelPlan.updateDates(request.getStartDate(), request.getEndDate());

        TravelPlan savedTravelPlan = travelPlanRepository.save(travelPlan);

        return new TravelPlanDateResponse("여행 날짜 저장 완료", savedTravelPlan.getId());
    }


    /**
     * 일정 목록 조회 메서드
     * @return
     */
    @Transactional(readOnly = true)
    public TravelPlanListResponse findAllTravelPlans() {
        List<TravelPlan> travelPlans = travelPlanRepository.findAll();

        List<TravelPlanListResponse.TravelPlanDto> travelPlanDtos = travelPlans.stream()
                .map(TravelPlanListResponse.TravelPlanDto::from)
                .collect(Collectors.toList());
        return TravelPlanListResponse.of("여행 일정 목록 조회 성공", travelPlanDtos);
    }

}
