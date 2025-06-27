package alt_t.truvel.location.locationDto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class LocationResponseDto {
    private Long locationId;
    private String place;
    private Float latitude;
    private Float longitude;
    private String address;
}
