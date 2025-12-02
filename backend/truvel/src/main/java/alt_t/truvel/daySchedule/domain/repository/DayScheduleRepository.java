package alt_t.truvel.daySchedule.domain.repository;

import alt_t.truvel.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DayScheduleRepository extends JpaRepository<DaySchedule, Long> {
    List<DaySchedule> findByTravelPlan(TravelPlan travelPlan);
}