package alt_t.truvel.location.service;

import java.util.List;

import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.location.domain.repository.LocationRepository;
import alt_t.truvel.location.locationDto.response.GooglePlaceResultDto;
import alt_t.truvel.location.locationDto.response.LocationResponseDto;
import alt_t.truvel.location.locationDto.request.LocationSaveRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class LocationService {

    private final GooglePlaceClient googlePlaceClient;
    private final LocationRepository locationRepository;

    // 장소 후보 검색
    public List<GooglePlaceResultDto> searchPlaces(String query) {
        return googlePlaceClient.search(query);
    }

    // 장소 저장
    public List<LocationResponseDto> saveSelectedPlaces(List<LocationSaveRequestDto> dtos) {
        return dtos.stream().map(dto -> {
            Location location = Location.builder()
                    .place(dto.getPlace())
                    .latitude(dto.getLatitude())
                    .longitude(dto.getLongitude())
                    .address(dto.getAddress())
                    .build();

            Location saved = locationRepository.save(location);

            return LocationResponseDto.builder()
                    .locationId(saved.getId()) // 이제 null 아님
                    .place(saved.getPlace())
                    .latitude(saved.getLatitude())
                    .longitude(saved.getLongitude())
                    .address(saved.getAddress())
                    .build();
        }).toList();
    }
}
