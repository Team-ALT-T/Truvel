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