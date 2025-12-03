package alt_t.truvel.location.locationDto.response;

import alt_t.truvel.location.domain.entity.Location;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class LocationResponseDto {
    private Long locationId;
    private String place;
    private Double latitude;
    private Double longitude;
    private String address;
    private String category;

    public LocationResponseDto (Location location){
        this.locationId = location.getLocation_id();
        this.place = location.getName();
        this.latitude = location.getLatitude();
        this.longitude = location.getLongitude();
        this.address = location.getAddress();
    }
}
