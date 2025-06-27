package alt_t.truvel.travelPlan.location;

import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.location.domain.repository.LocationRepository;
import alt_t.truvel.location.locationDto.request.LocationSaveRequestDto;
import alt_t.truvel.location.locationDto.response.GooglePlaceResultDto;
import alt_t.truvel.location.locationDto.response.LocationResponseDto;
import alt_t.truvel.location.service.GooglePlaceClient;
import alt_t.truvel.location.service.LocationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LocationServiceTest {

    @Mock
    private GooglePlaceClient googlePlaceClient;

    @Mock
    private LocationRepository locationRepository;

    @InjectMocks
    private LocationService locationService;

    @Test
    @DisplayName("GooglePlaceClient가 반환한 결과를 그대로 리턴한다")
    void searchPlaces_returnsClientResults() {
        // given
        String query = "서울타워";
        List<GooglePlaceResultDto> mockResults = List.of(
                new GooglePlaceResultDto("서울타워", 37.5512f, 126.9882f, "서울특별시 용산구 남산공원길 105")
        );

        when(googlePlaceClient.search(query)).thenReturn(mockResults);

        // when
        List<GooglePlaceResultDto> result = locationService.searchPlaces(query);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("서울타워");
        verify(googlePlaceClient).search(query);
    }

    @Test
    @DisplayName("장소 저장 요청 DTO 리스트를 받아 DB에 저장 후 응답 DTO로 반환")
    void saveSelectedPlaces_savesLocationsAndReturnsDtos() {
        // given
        List<LocationSaveRequestDto> requestDtos = List.of(
                new LocationSaveRequestDto("서울타워", 37.5512f, 126.9882f, "서울특별시 용산구 남산공원길 105")
        );

        when(locationRepository.save(any(Location.class)))
                .thenAnswer(invocation -> {
                    Location loc = invocation.getArgument(0);
                    // 테스트 전용 생성자 사용
                    return new Location(1L, loc.getPlace(), loc.getLatitude(), loc.getLongitude(), loc.getAddress());
                });

        // when
        List<LocationResponseDto> result = locationService.saveSelectedPlaces(requestDtos);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLocationId()).isEqualTo(1L);
        assertThat(result.get(0).getPlace()).isEqualTo("서울타워");
        assertThat(result.get(0).getLatitude()).isEqualTo(37.5512f);
        assertThat(result.get(0).getLongitude()).isEqualTo(126.9882f);
        assertThat(result.get(0).getAddress()).isEqualTo("서울특별시 용산구 남산공원길 105");
    }
}
