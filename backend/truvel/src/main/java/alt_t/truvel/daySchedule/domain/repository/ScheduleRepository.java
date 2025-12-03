package alt_t.truvel.daySchedule.domain.repository;

import alt_t.truvel.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.daySchedule.domain.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule,Long> {
    List<Schedule> findByDaySchedule(DaySchedule daySchedule);
    boolean existsByDayScheduleAndLocation(DaySchedule daySchedule, Location location);

    @Query("SELECT s.location FROM Schedule s JOIN s.daySchedule ds WHERE ds.travelPlan.id = :travelPlanId")
    List<Location> findLocationsByTravelPlanId(@Param("travelPlanId") Long travelPlanId);
}
