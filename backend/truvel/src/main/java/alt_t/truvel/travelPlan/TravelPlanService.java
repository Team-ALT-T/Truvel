package alt_t.truvel.travelPlan;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class TravelPlanService {

    private final TravelPlanRepository travelPlanRepository;

    public TravelPlanDraftResponse createTravelPlanDraft(TravelPlanDraftRequest request) {

         // TravelPlan 엔티티 생성 - request 객체의 변환 메소드 활용
        TravelPlan travelPlanDraft = request.toTravelPlanDraft();
    
        TravelPlan savedTravelPlan = travelPlanRepository.save(travelPlanDraft);

        return new TravelPlanDraftResponse("여행 초안 생성 완료", savedTravelPlan.getId()); // 응답 DTO 반환

    }

    public TravelPlanDataResponse saveTravelPlanDate(Long travelPlanId, TravelPlanDateRequest request) {
        // 기존 여행 계획 조회
        TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId)
                .orElseThrow(() -> new NoSuchElementException("해당 여행 계획페이지가 없습니다."));

        // 날짜 업데이트
        travelPlan.updateDates(request.getStart_date(), request.getEnd_date());

        TravelPlan savedTravelPlan = travelPlanRepository.save(travelPlan);

        return new TravelPlanDataResponse("여행 날짜 저장 완료", savedTravelPlan.getId());
    }

}
