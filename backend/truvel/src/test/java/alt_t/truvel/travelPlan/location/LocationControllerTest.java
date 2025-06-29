package alt_t.truvel.travelPlan.location;

import alt_t.truvel.location.controller.LocationController;
import alt_t.truvel.location.locationDto.response.GooglePlaceResultDto;
import alt_t.truvel.location.service.LocationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LocationController.class)
@Import(LocationControllerTest.TestMockConfig.class)
class LocationControllerTest {

    @TestConfiguration
    static class TestMockConfig {
        @Bean
        public LocationService locationService() {
            return mock(LocationService.class);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LocationService locationService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /locations/search?query=서울타워 → 장소 검색 결과 리턴")
    void searchPlaces_returnsResults() throws Exception {
        // given
        String query = "서울타워";
        List<GooglePlaceResultDto> mockResults = List.of(
                new GooglePlaceResultDto("서울타워", 37.5512f, 126.9882f, "서울특별시 용산구 남산공원길 105")
        );

        when(locationService.searchPlaces(query)).thenReturn(mockResults);

        // when & then
        mockMvc.perform(get("/locations/search")
                        .param("query", query))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("서울타워"))
                .andExpect(jsonPath("$[0].latitude").value(37.5512))
                .andExpect(jsonPath("$[0].longitude").value(126.9882))
                .andExpect(jsonPath("$[0].address").value("서울특별시 용산구 남산공원길 105"));
    }
}
