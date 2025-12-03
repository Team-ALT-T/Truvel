package alt_t.truvel.location.locationDto.request;

import alt_t.truvel.location.PlaceCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationSaveRequestDto {
    private String name;
    private Double latitude;
    private Double longitude;
    private String address;
    @Builder.Default
    private PlaceCategory category = PlaceCategory.DEFAULT;
}
