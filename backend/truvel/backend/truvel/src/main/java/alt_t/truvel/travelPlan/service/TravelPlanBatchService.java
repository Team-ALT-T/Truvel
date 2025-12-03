package alt_t.truvel.travelPlan.service;

import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TravelPlanBatchService {

    private final TravelPlanRepository travelPlanRepository;

    @Transactional
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정에 실행
    public void deleteOldTravelPlans() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        travelPlanRepository.deleteByModifiedAtBefore(sixMonthsAgo);
    }
}