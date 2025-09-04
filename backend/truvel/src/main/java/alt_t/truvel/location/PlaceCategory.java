package alt_t.truvel.location;

import lombok.Getter;

import java.time.Duration;

@Getter
public enum PlaceCategory {
    DEFAULT(Duration.ofHours(1L)),
    CAFE(Duration.ofHours(2L)),
    RESTAURANT(Duration.ofHours(2L));

    PlaceCategory(Duration stayTime){
        this.stayTime = stayTime;
    }
    private final Duration stayTime;
}
