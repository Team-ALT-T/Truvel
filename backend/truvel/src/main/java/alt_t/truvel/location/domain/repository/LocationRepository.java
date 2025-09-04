package alt_t.truvel.location.domain.repository;


import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Location findByTravelPlan(TravelPlan travelPlan);

    Optional<Location> findByName(@NotNull String name);
}

