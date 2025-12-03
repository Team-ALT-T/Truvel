package alt_t.truvel.location.controller;

import alt_t.truvel.location.locationDto.response.LocationResponseDto;
import alt_t.truvel.location.locationDto.request.LocationSaveRequestDto;
import alt_t.truvel.location.locationDto.response.GooglePlaceResultDto;
import alt_t.truvel.location.service.LocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/locations")
@Tag(name = "구글 맵 장소 검색 API", description = "장소 검색 및 저장 관련 API")
public class LocationController {

    private final LocationService locationService;

    // 장소 검색
    @GetMapping("/search")
    @Operation(summary = "장소 검색", description = "구글 맵 API를 통해 장소를 검색합니다.")
    public ResponseEntity<?> searchPlaces(@RequestParam String query) {
        List<GooglePlaceResultDto> results = locationService.searchPlaces(query);

        return ResponseEntity.ok(results);
    }

    //장소 저장
    @PostMapping
    @Operation(summary = "장소 저장", description = "선택한 장소들을 DB에 저장합니다.")
    public ResponseEntity<List<LocationResponseDto>> saveMultipleLocations(@RequestBody List<LocationSaveRequestDto> dtos) {
        List<LocationResponseDto> responseDtos = locationService.saveSelectedPlaces(dtos);
        return ResponseEntity.status(201).body(responseDtos);
    }

}
