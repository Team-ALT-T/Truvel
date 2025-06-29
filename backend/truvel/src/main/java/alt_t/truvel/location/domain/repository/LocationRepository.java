package alt_t.truvel.location.domain.repository;


import alt_t.truvel.location.domain.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {
}
