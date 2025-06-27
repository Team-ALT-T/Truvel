package alt_t.truvel.travelPlan;

import alt_t.truvel.user.User;
import alt_t.truvel.user.UserRepository;
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

    private final UserRepository userRepository;


    /**
     * 일정 생성 메서드
     * @param userId : 사용자의 아이디
     * @param request : 여행 일정 요청 DTO
     * @return : 응답 성공 메시지와 DB에 저장된 여행 일정의 아이디 반환
     */
    @Transactional
    public TravelPlanResponse createTravelPlan(Long userId, TravelPlanRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        TravelPlan travelPlan = request.toTravelPlan();
        user.addTravelPlan(travelPlan);

        TravelPlan savedTravelPlan = travelPlanRepository.save(travelPlan);

        return TravelPlanResponse.of("여행 일정이 생성되었습니다", savedTravelPlan.getId());

    }


    /**
     * 일정 목록 조회 메서드
     * @return
     */
    @Transactional(readOnly = true)
    public List<TravelPlanResponse> getTravelPlans(Long userId) {

        // 사용자가 있는지 검증
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 여행 일정들을 목록으로 반환
        return travelPlanRepository.findByUserId(userId)
                .stream()
                .map(travelPlan -> TravelPlanResponse.toTravelPlanList(
                        travelPlan.getId(),
                        travelPlan.getStartDate(),
                        travelPlan.getEndDate(),
                        travelPlan.getNation(),
                        travelPlan.getCity()))
                .toList();

    }


    /**
     * 여행 일정 단건 조회 메서드
     * @param userId : 사용자의 아이디
     * @param travelPlanId : 여행 일정 아이디
     * @return : 여행 일정 하나를 반환
     */
    @Transactional(readOnly = true)
    public TravelPlanResponse getTravelPlan(Long userId, Long travelPlanId) {

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId)
                .orElseThrow(() -> new IllegalArgumentException("여행 일정을 찾을 수 없습니다."));

        return TravelPlanResponse.toTravelPlan(
                "여행 일정 단건 조회 성공",
                travelPlan.getId(),
                travelPlan.getStartDate(),
                travelPlan.getEndDate(),
                travelPlan.getNation(),
                travelPlan.getCity()
        );

    }


}
