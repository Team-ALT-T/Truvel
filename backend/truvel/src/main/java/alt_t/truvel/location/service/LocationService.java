package alt_t.truvel.location.service;

import java.util.List;

import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.location.domain.repository.LocationRepository;
import alt_t.truvel.location.locationDto.response.GooglePlaceResult;
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
    public List<GooglePlaceResult> searchPlaces(String query) {
        return googlePlaceClient.search(query);
    }
}