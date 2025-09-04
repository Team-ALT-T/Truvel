package alt_t.truvel.routeOptimization.daySchedule.enums;

import java.time.LocalTime;

import static java.time.LocalTime.of;

public enum PreferTime {
//    아침 : 오전 8시 - 오후 12시
//    점심 : 오후 12시 - 오후 5시
//    저녁 : 오후 5시 - 오후 10시
    Morning,
    Afternoon,
    Evening,
    // 비지니스 로직에서 아침, 점심, 저녁 중 하나로 랜덤하게 바뀜
    Random;
    public static final LocalTime MAX_MORNING_TIME = of(12,0);
    public static final LocalTime MAX_AFTERNOON_TIME = of(17,0);
    public static final LocalTime MAX_EVENING_TIME = of(22,0);
}
