package alt_t.truvel.travelPlan;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

}
