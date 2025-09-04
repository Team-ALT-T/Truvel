package alt_t.truvel.location.controller;

import alt_t.truvel.location.locationDto.response.LocationResponseDto;
import alt_t.truvel.location.locationDto.request.LocationSaveRequestDto;
import alt_t.truvel.location.locationDto.response.GooglePlaceResultDto;
import alt_t.truvel.location.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/locations/{travel_plan_id}")
public class LocationController {

    private final LocationService locationService;

    // 장소 검색
    @GetMapping("/search")
    public ResponseEntity<?> searchPlaces(@RequestParam String query) {
        List<GooglePlaceResultDto> results = locationService.searchPlaces(query);

        return ResponseEntity.ok(results);
    }

    //장소 저장
    @PostMapping
    public ResponseEntity<List<LocationResponseDto>> saveMultipleLocations(@RequestBody List<LocationSaveRequestDto> dtos, @PathVariable Long travel_plan_id) {
        List<LocationResponseDto> responseDtos = locationService.saveSelectedPlaces(travel_plan_id, dtos);
        return ResponseEntity.status(201).body(responseDtos);
    }

}
