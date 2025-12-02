package alt_t.truvel.location.repository;

import alt_t.truvel.location.PlaceCategory;
import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.location.domain.repository.LocationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test") // application-test.yml 설정을 사용합니다.
class LocationRepositoryTest {

    @Autowired
    private LocationRepository locationRepository;

    private Location testLocation;

    @BeforeEach
    void setUp() {
        // 각 테스트 전에 데이터베이스를 초기화하고 테스트 데이터를 저장합니다.
        locationRepository.deleteAll();
        testLocation = Location.builder()
                .name("테스트 장소")
                .address("테스트 주소")
                .category(PlaceCategory.ATTRACTION)
                .latitude(37.5665)
                .longitude(126.9780)
                .build();
        locationRepository.save(testLocation);
    }

    @Test
    @DisplayName("이름으로 장소 조회 - 성공")
    void findByName_Success() {
        // given
        String nameToFind = "테스트 장소";

        // when
        Optional<Location> foundLocation = locationRepository.findByName(nameToFind);

        // then
        assertTrue(foundLocation.isPresent(), "저장된 이름으로 장소를 찾을 수 있어야 합니다.");
        assertEquals(testLocation.getLocation_id(), foundLocation.get().getLocation_id());
        assertEquals(nameToFind, foundLocation.get().getName());
    }

    @Test
    @DisplayName("이름으로 장소 조회 - 실패 (존재하지 않는 이름)")
    void findByName_NotFound() {
        // when
        Optional<Location> foundLocation = locationRepository.findByName("존재하지 않는 장소");

        // then
        assertFalse(foundLocation.isPresent(), "존재하지 않는 이름으로 조회 시 결과가 없어야 합니다.");
    }
}