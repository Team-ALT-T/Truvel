package alt_t.truvel.travelPlan;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelPlanRepository extends JpaRepository<TravelPlan, Long> {

    /**
     * 여행 일정 목록 조회시 사용
     * @param userId : 사용자 아이디
     * @return : 조회된 여행 일정들을 리스트로 묶어서 반환
     */
    List<TravelPlan> findByUserId(Long userId);
}
