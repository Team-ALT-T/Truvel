package alt_t.truvel.routeOptimization.daySchedule.service;

import alt_t.truvel.exception.RouteOptException;
import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.routeOptimization.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.routeOptimization.daySchedule.domain.entity.Schedule;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class RouteOptimization {

    // 경로 최적화
    public static List<Schedule> optimization(List<Schedule> schedules, DaySchedule daySchedule){
        List<Schedule> morningSchedule = new ArrayList<>();
        List<Schedule> afternoonSchedule = new ArrayList<>();
        List<Schedule> eveningSchedule = new ArrayList<>();
        List<Schedule> randomSchedule = new ArrayList<>();
        List<Schedule> results = new ArrayList<>();

        // 각 시간대별 총 소요 시간 계산
        LocalTime morningEndTime = LocalTime.of(8, 0); // 아침 시작 시간
        LocalTime afternoonEndTime = LocalTime.of(12, 0); // 점심 시작 시간
        LocalTime eveningEndTime = LocalTime.of(17, 0); // 저녁 시작 시간

        // 가고싶은 시간대에 따라 분류해서 List에 넣어둠
        for (Schedule schedule : schedules) {
            switch (schedule.getPreferTime()){
                case Morning -> {
                    morningSchedule.add(schedule);
                    morningEndTime = morningEndTime.plus(schedule.getStayTime());
                }
                case Afternoon -> {
                    afternoonSchedule.add(schedule);
                    afternoonEndTime = afternoonEndTime.plus(schedule.getStayTime());
                }
                case Evening -> {
                    eveningSchedule.add(schedule);
                    eveningEndTime = eveningEndTime.plus(schedule.getStayTime());
                }
                case Random -> randomSchedule.add(schedule);
            }
        }
        
        // 각 List를 마지막 행선지에 대한 최소비용 알고리즘으로 정렬
        sortSchedule(daySchedule, morningSchedule, "morning");
        sortSchedule(daySchedule, afternoonSchedule, "afternoon");
        sortSchedule(daySchedule, eveningSchedule, "evening");

        // randomSchedule의 스케줄들을 위치 기반 최단거리 알고리즘으로 분류
        for (Schedule schedule : randomSchedule) {
            addScheduleToNearestTimeSlot(schedule, morningSchedule, afternoonSchedule, eveningSchedule, daySchedule);
        }
        
        // 모든 스케줄을 results에 합치기
        results.addAll(morningSchedule);
        results.addAll(afternoonSchedule);
        results.addAll(eveningSchedule);
        return results;
    }

    // 최소비용(최단거리) 알고리즘: Nearest Neighbor 방식
    private static void sortSchedule(DaySchedule daySchedule, List<Schedule> schedules, String timeSlot){
        if (schedules.isEmpty()) return;

        List<Schedule> sorted = new ArrayList<>();
        Location currentLocation;
        switch (timeSlot){
            case "morning" -> currentLocation = daySchedule.getStartLocation();
            case "afternoon", "evening" -> currentLocation = schedules.get(schedules.size() - 1).getLocation();
            default -> throw new RouteOptException("알 수 없는 시간대: " + timeSlot);
        }

        List<Schedule> temp = new ArrayList<>(schedules);
        while (!temp.isEmpty()) {
            Schedule nearest = temp.get(0);
            double minDist = calculateDistance(currentLocation, nearest.getLocation());
            for (Schedule s : temp) {
                double dist = calculateDistance(currentLocation, s.getLocation());
                if (dist < minDist) {
                    minDist = dist;
                    nearest = s;
                }
            }
            sorted.add(nearest);
            currentLocation = nearest.getLocation();
            temp.remove(nearest);
        }

        // 기존 리스트에 정렬된 결과 반영
        schedules.clear();
        System.out.println("Sorted " + timeSlot + " schedules: " + sorted);
        schedules.addAll(sorted);
    }
    

     // randomSchedule의 스케줄을 위치 기반 최단거리로 가장 가까운 시간대에 추가
    private static void addScheduleToNearestTimeSlot(Schedule randomSchedule, 
                                                    List<Schedule> morningSchedule,
                                                    List<Schedule> afternoonSchedule,
                                                    List<Schedule> eveningSchedule,
                                                    DaySchedule daySchedule) {
        
        double minDistance = Double.MAX_VALUE;
        String nearestTimeSlot = "morning";
        
        // 아침 스케줄의 마지막 요소와의 거리 계산
        double distanceToMorning = calculateTotalDistanceForTimeSlot(randomSchedule, morningSchedule, "morning", daySchedule);
        if (distanceToMorning < minDistance) {
            minDistance = distanceToMorning;
            nearestTimeSlot = "morning";
        }

        // 점심 스케줄의 마지막 요소와의 거리 계산
        double distanceToAfternoon = calculateTotalDistanceForTimeSlot(randomSchedule, afternoonSchedule, "afternoon", daySchedule);
        if (distanceToAfternoon < minDistance) {
            minDistance = distanceToAfternoon;
            nearestTimeSlot = "afternoon";
        }

        // 저녁 스케줄의 마지막 요소와의 거리 계산
        double distanceToEvening = calculateTotalDistanceForTimeSlot(randomSchedule, eveningSchedule, "evening", daySchedule);
        if (distanceToEvening < minDistance) {
            minDistance = distanceToEvening;
            nearestTimeSlot = "evening";
        }
        
        // 가장 가까운 시간대에 스케줄 추가
        switch (nearestTimeSlot) {
            case "morning" -> morningSchedule.add(randomSchedule);
            case "afternoon" -> afternoonSchedule.add(randomSchedule);
            case "evening" -> eveningSchedule.add(randomSchedule);
            default -> {
                throw new RouteOptException("알 수 없는 시간대: " + nearestTimeSlot);
            }
        }
    }
    
    /**
     * 특정 시간대에 스케줄을 추가했을 때의 총 거리 계산
     */
    private static double calculateTotalDistanceForTimeSlot(Schedule newSchedule, 
                                                          List<Schedule> timeSlotSchedule,
                                                          String timeSlot,
                                                          DaySchedule daySchedule) {
        double totalDistance = 0;
        try{
            if (timeSlotSchedule.isEmpty()) {
                totalDistance = calculateDistance(daySchedule.getStartLocation(), newSchedule.getLocation());
            }
            else {
                // 기존 마지막 스케줄에서 새 스케줄까지의 거리 계산
                totalDistance = calculateDistance(
                    timeSlotSchedule.get(timeSlotSchedule.size() - 1).getLocation(),
                    newSchedule.getLocation()
                );
            }
        }
        catch (NullPointerException e){
            return 0;
        }
        catch (Exception e){
            throw new RouteOptException("특정 시간대에 스케줄을 추가할 때 거리 계산 오류: " + e.getMessage());
        }
        return totalDistance;
    }

    /**
     * 두 위치 간의 거리를 계산 (Haversine 공식 사용)
     * @param location1 첫 번째 위치
     * @param location2 두 번째 위치
     * @return 두 위치 간의 거리 (킬로미터)
     */
    private static double calculateDistance(Location location1, Location location2) {
        final double R = 6371; // 지구의 반지름 (킬로미터)
        
        double lat1 = Math.toRadians(location1.getLatitude());
        double lon1 = Math.toRadians(location1.getLongitude());
        double lat2 = Math.toRadians(location2.getLatitude());
        double lon2 = Math.toRadians(location2.getLongitude());
        
        double dLat = lat2 - lat1;
        double dLon = lon2 - lon1;
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(lat1) * Math.cos(lat2) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}