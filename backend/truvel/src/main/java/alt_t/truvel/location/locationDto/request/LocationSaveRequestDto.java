package alt_t.truvel.location.locationDto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationSaveRequestDto {
    private String place;
    private Float latitude;
    private Float longitude;
    private String address;
}
