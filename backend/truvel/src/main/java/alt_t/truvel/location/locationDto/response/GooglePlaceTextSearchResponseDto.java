package alt_t.truvel.location.locationDto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GooglePlaceTextSearchResponseDto {

    @JsonProperty("status")
    private String status;

    @JsonProperty("results")
    private List<Result> results;

    @Getter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Result {
        private String name;

        @JsonProperty("formatted_address")
        private String formattedAddress;

        private Geometry geometry;

        // 평점 (0.0 ~ 5.0)
        private Float rating;

        // 리뷰 수
        @JsonProperty("user_ratings_total")
        private Integer userRatingsTotal;

        // 카테고리 (예: ["restaurant", "food", "point_of_interest"])
        private List<String> types;

        // 사진 정보
        private List<Photo> photos;

        // 가격대 (0 ~ 4)
        @JsonProperty("price_level")
        private Integer priceLevel;

        // 영업 중 여부
        @JsonProperty("opening_hours")
        private OpeningHours openingHours;

        @Getter
        @NoArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Photo {
            @JsonProperty("photo_reference")
            private String photoReference;

            private Integer height;
            private Integer width;
        }

        @Getter
        @NoArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class OpeningHours {
            @JsonProperty("open_now")
            private Boolean openNow;
        }

        @Getter
        @NoArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Geometry {
            private Location location;

            @Getter
            @NoArgsConstructor
            @JsonIgnoreProperties(ignoreUnknown = true)
            public static class Location {
                private float lat;
                private float lng;
            }
        }
    }
}