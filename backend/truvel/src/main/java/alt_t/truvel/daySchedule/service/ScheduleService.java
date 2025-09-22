package alt_t.truvel.daySchedule.service;

import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.location.domain.repository.LocationRepository;
import alt_t.truvel.daySchedule.dayScheduleDTO.requset.ScheduleRequest;
import alt_t.truvel.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.daySchedule.domain.entity.Schedule;
import alt_t.truvel.daySchedule.domain.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final LocationRepository locationRepository;

    public void createSchedule(DaySchedule daySchedule, List<ScheduleRequest> scheduleRequests){
        List<Schedule> schedules = new ArrayList<>();
        scheduleRequests.forEach(scheduleRequest -> {
            Location location = locationRepository.findByName(scheduleRequest.getLocationName())
                    .orElseThrow(() -> new NoSuchElementException(scheduleRequest.getLocationName() + "를 찾을 수 없습니다."));

            log.debug("Checking existence for DaySchedule ID: {} and Location: {}", daySchedule.getDay_schedule_id(), location.getName());

            schedules.add(Schedule.of(daySchedule, scheduleRequest, location));
        });

        setStayTime(schedules);
        daySchedule.updateSchedules(scheduleRepository.saveAll(schedules));
    }

    // stayTime이 비어있으면 category에 맞춰 자동으로 stayTime을 설정해주는 함수
    private void setStayTime(List<Schedule> schedules){
        schedules.forEach(schedule -> {
            if (schedule.getStayTime() == null){
                schedule.updateStayTime(schedule.getLocation().getCategory().getStayTime());
            }
        });
    }
}
