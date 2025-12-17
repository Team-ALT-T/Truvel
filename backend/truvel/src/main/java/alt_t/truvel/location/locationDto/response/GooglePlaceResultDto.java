package alt_t.truvel.location.locationDto.response;

import java.util.List;

public record GooglePlaceResultDto(
        String name,
        float latitude,
        float longitude,
        String address,
        Float rating,
        Integer reviewCount,
        List<String> types,
        String photoReference,
        Boolean openNow
) {}
