package alt_t.truvel.travelPlan.location;

import alt_t.truvel.location.locationDto.response.GooglePlaceResultDto;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LocationServiceTest {

    @Mock
    private GooglePlaceClient googlePlaceClient;

    @InjectMocks
    private LocationService locationService; // 자동으로 위 mock을 주입

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
}