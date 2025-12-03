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

    public List<GooglePlaceResultDto> search(String query) {
        String url = "https://maps.googleapis.com/maps/api/place/textsearch/json" +
                "?query={query}" +
                "&key={key}" +
                "&language=ko";

        System.out.println("[GooglePlaceClient] 요청 URL 템플릿: " + url);

        try {
            ResponseEntity<GooglePlaceTextSearchResponseDto> response =
                    restTemplate.getForEntity(url, GooglePlaceTextSearchResponseDto.class, query, apiKey);

            GooglePlaceTextSearchResponseDto body = response.getBody();
            System.out.println("[GooglePlaceClient] 응답 body: " + body);

            if (body == null || !"OK".equals(body.getStatus())) {
                throw new CustomException(ErrorCode.GOOGLE_API_ERROR);
            }

            if (body.getResults() == null || body.getResults().isEmpty()) {
                System.out.println("[GooglePlaceClient] 결과 없음 (results가 비어있음)");
                throw new CustomException(ErrorCode.PLACE_NOT_FOUND);
            }

            return body.getResults().stream().map(r ->
                    new GooglePlaceResultDto(
                            r.getName(),
                            r.getGeometry().getLocation().getLat(),
                            r.getGeometry().getLocation().getLng(),
                            r.getFormattedAddress()
                    )
            ).toList();

        } catch (RestClientException e) {
            e.printStackTrace();
            throw new CustomException(ErrorCode.GOOGLE_API_ERROR);
        }
    }
}
