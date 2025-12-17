package alt_t.truvel.location.service;

import alt_t.truvel.exception.CustomException;
import alt_t.truvel.exception.ErrorCode;
import alt_t.truvel.location.locationDto.response.GooglePlaceTextSearchResponseDto;
import alt_t.truvel.location.locationDto.response.GooglePlaceResultDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@RequiredArgsConstructor
public class GooglePlaceClient {

    private final RestTemplate restTemplate;

    @Value("${spring.google.api.key}")
    private String apiKey;

    public List<GooglePlaceResultDto> search(String query, Double lat, Double lng) {
        StringBuilder urlBuilder = new StringBuilder("https://maps.googleapis.com/maps/api/place/textsearch/json");
        urlBuilder.append("?query={query}");
        
        // 위치 정보가 있으면 location과 radius 파라미터 추가
        if (lat != null && lng != null) {
            urlBuilder.append("&location={lat},{lng}");
            urlBuilder.append("&radius=10000"); // 10km 반경
        }
        
        urlBuilder.append("&language=ko");
        urlBuilder.append("&key={key}");

        String url = urlBuilder.toString();
        System.out.println("[GooglePlaceClient] 요청 URL 템플릿: " + url);
        System.out.println("[GooglePlaceClient] 검색 위치: lat=" + lat + ", lng=" + lng);

        try {
            ResponseEntity<GooglePlaceTextSearchResponseDto> response;
            
            if (lat != null && lng != null) {
                response = restTemplate.getForEntity(
                    url, 
                    GooglePlaceTextSearchResponseDto.class, 
                    query, 
                    lat, 
                    lng, 
                    apiKey
                );
            } else {
                // 위치 정보 없으면 기존 방식
                response = restTemplate.getForEntity(
                    url, 
                    GooglePlaceTextSearchResponseDto.class, 
                    query, 
                    apiKey
                );
            }

            GooglePlaceTextSearchResponseDto body = response.getBody();
            System.out.println("[GooglePlaceClient] 응답 body: " + body);

            if (body == null || !"OK".equals(body.getStatus())) {
                throw new CustomException(ErrorCode.GOOGLE_API_ERROR);
            }

            if (body.getResults() == null || body.getResults().isEmpty()) {
                System.out.println("[GooglePlaceClient] 결과 없음 (results가 비어있음)");
                throw new CustomException(ErrorCode.PLACE_NOT_FOUND);
            }

            return body.getResults().stream().map(r -> {
                // 첫 번째 사진의 photo_reference 가져오기
                String photoRef = null;
                if (r.getPhotos() != null && !r.getPhotos().isEmpty()) {
                    photoRef = r.getPhotos().get(0).getPhotoReference();
                }

                // 영업 중 여부
                Boolean openNow = null;
                if (r.getOpeningHours() != null) {
                    openNow = r.getOpeningHours().getOpenNow();
                }

                return new GooglePlaceResultDto(
                        r.getName(),
                        r.getGeometry().getLocation().getLat(),
                        r.getGeometry().getLocation().getLng(),
                        r.getFormattedAddress(),
                        r.getRating(),
                        r.getUserRatingsTotal(),
                        r.getTypes(),
                        photoRef,
                        openNow
                );
            }).toList();

        } catch (RestClientException e) {
            e.printStackTrace();
            throw new CustomException(ErrorCode.GOOGLE_API_ERROR);
        }
    }
}
