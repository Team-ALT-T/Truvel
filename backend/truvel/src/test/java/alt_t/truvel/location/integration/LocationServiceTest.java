package alt_t.truvel.location.integration;

import alt_t.truvel.location.PlaceCategory;
import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.location.domain.repository.LocationRepository;
import alt_t.truvel.location.locationDto.request.LocationSaveRequestDto;
import alt_t.truvel.location.service.LocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional // 테스트 후 데이터베이스 롤백
class LocationServiceTest {

    @Autowired
    private LocationService locationService;

    @Autowired
    private LocationRepository locationRepository;

    private Location savedLocation1;
    private Location savedLocation2;

    @BeforeEach
    void setUp() {
        // 테스트 데이터 미리 저장
        locationRepository.deleteAll(); // 깨끗한 상태에서 시작

        savedLocation1 = Location.builder()
                .name("경복궁")
                .address("서울 종로구 사직로 161")
                .category(PlaceCategory.ATTRACTION)
                .build();

        savedLocation2 = Location.builder()
                .name("N서울타워")
                .address("서울 용산구 남산공원길 105")
                .category(PlaceCategory.ATTRACTION)
                .build();

        locationRepository.saveAll(List.of(savedLocation1, savedLocation2));
    }

    @Test
    @DisplayName("선택된 장소 목록 저장")
    void saveSelectedPlaces() {
        // given
        // 서비스는 LocationSaveRequestDto 리스트를 받음
        LocationSaveRequestDto newPlaceDto = LocationSaveRequestDto.builder()
                .name("롯데월드")
                .address("서울 송파구 올림픽로 240")
                .category(PlaceCategory.ATTRACTION)
                .latitude(37.5111)
                .longitude(127.0982)
                .build();

        // when
        locationService.saveSelectedPlaces(List.of(newPlaceDto));

        // then
        long totalLocations = locationRepository.count();
        assertEquals(3, totalLocations, "기존 2개 + 신규 1개 = 총 3개의 장소가 있어야 합니다.");
        assertTrue(locationRepository.findByName("롯데월드").isPresent(), "새로운 장소 '롯데월드'가 저장되어야 합니다.");
    }

    @Test
    @DisplayName("모든 저장된 장소 조회")
    void getAllLocations() {
        // when
        List<Location> locations = locationService.getAllLocations();

        // then
        assertNotNull(locations);
        assertEquals(2, locations.size(), "setUp에서 저장한 2개의 장소가 조회되어야 합니다.");
    }

    @Test
    @DisplayName("ID로 특정 장소 조회")
    void getLocationById() {
        // when
        Location foundLocation = locationService.getLocationById(savedLocation1.getLocation_id());

        // then
        assertNotNull(foundLocation);
        assertEquals("경복궁", foundLocation.getName());
        assertEquals(savedLocation1.getLocation_id(), foundLocation.getLocation_id());

        // 존재하지 않는 ID 조회 시 예외 발생 검증
        assertThrows(IllegalArgumentException.class, () -> {
            locationService.getLocationById(9999L);
        });
    }

    @Test
    @DisplayName("이름으로 특정 장소 조회")
    void getLocationByName() {
        // when
        Location foundLocation = locationService.getLocationByName("N서울타워");

        // then
        assertNotNull(foundLocation);
        assertEquals("N서울타워", foundLocation.getName());
        assertEquals(savedLocation2.getLocation_id(), foundLocation.getLocation_id());

        // 존재하지 않는 이름 조회 시 예외 발생 검증
        assertThrows(IllegalArgumentException.class, () -> {
            locationService.getLocationByName("없는장소");
        });
    }
}