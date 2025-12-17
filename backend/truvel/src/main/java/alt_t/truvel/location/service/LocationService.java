package alt_t.truvel.location.service;

import alt_t.truvel.daySchedule.domain.repository.ScheduleRepository;
import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.location.domain.repository.LocationRepository;
import alt_t.truvel.location.locationDto.response.GooglePlaceResultDto;
import alt_t.truvel.location.locationDto.response.LocationResponseDto;
import alt_t.truvel.location.locationDto.request.LocationSaveRequestDto;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class LocationService {

    private final GooglePlaceClient googlePlaceClient;
    private final LocationRepository locationRepository;
    private final TravelPlanRepository travelPlanRepository;
    private final ScheduleRepository scheduleRepository;

    // 장소 후보 검색
    public List<GooglePlaceResultDto> searchPlaces(String query, Double lat, Double lng) {
        return googlePlaceClient.search(query, lat, lng);
    }

    // 장소 저장
    public List<LocationResponseDto> saveSelectedPlaces(List<LocationSaveRequestDto> dtos) {
        return dtos.stream().map(dto -> {
            Location location = Location.builder()
                    .name(dto.getName())
                    .latitude(dto.getLatitude())
                    .longitude(dto.getLongitude())
                    .address(dto.getAddress())
                    .category(dto.getCategory())
                    .build();
            System.out.println("[LocationService] 저장할 장소 정보: " + location.getCategory());
            Location saved = locationRepository.save(location);

            return LocationResponseDto.builder()
                    .locationId(saved.getLocation_id()) // 이제 null 아님
                    .place(saved.getName())
                    .latitude(saved.getLatitude())
                    .longitude(saved.getLongitude())
                    .address(saved.getAddress())
                    .category(String.valueOf(saved.getCategory()))
                    .build();
        }).toList();
    }

    // 여행 계획에 저장된 장소 목록
    public List<LocationResponseDto> getAll(Long travelPlan_id){
        List<Location> locations = scheduleRepository.findLocationsByTravelPlanId(travelPlan_id);
        return locations.stream().map(LocationResponseDto::new).toList();
    }

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Location getLocationById(Long id) {
        return locationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Invalid location ID: " + id));
    }

    public Location getLocationByName(String name) {
        return locationRepository.findByName(name).orElseThrow(() -> new IllegalArgumentException("Invalid location name: " + name));
    }

    public String deleteLocation(Long id){
        locationRepository.deleteById(id);
        return "삭제 완료";
    }
}
