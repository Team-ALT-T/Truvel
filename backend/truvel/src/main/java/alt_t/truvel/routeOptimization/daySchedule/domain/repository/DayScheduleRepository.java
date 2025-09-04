package alt_t.truvel.routeOptimization.daySchedule.domain.repository;

import alt_t.truvel.routeOptimization.daySchedule.domain.entity.DaySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DayScheduleRepository extends JpaRepository<DaySchedule, Long> {

}