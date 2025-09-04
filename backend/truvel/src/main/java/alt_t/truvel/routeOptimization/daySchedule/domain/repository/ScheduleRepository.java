package alt_t.truvel.routeOptimization.daySchedule.domain.repository;

import alt_t.truvel.routeOptimization.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.routeOptimization.daySchedule.domain.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule,Long> {
    List<Schedule> findByDaySchedule(DaySchedule daySchedule);
    boolean existsByDayScheduleAndLocation(DaySchedule daySchedule, Location location);
}
