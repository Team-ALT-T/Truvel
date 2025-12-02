package alt_t.truvel.daySchedule.service;

import alt_t.truvel.daySchedule.dayScheduleDTO.requset.ScheduleRequest;
import alt_t.truvel.daySchedule.domain.entity.DaySchedule;
import alt_t.truvel.daySchedule.domain.entity.Schedule;
import alt_t.truvel.daySchedule.domain.repository.ScheduleRepository;
import alt_t.truvel.daySchedule.enums.PreferTime;
import alt_t.truvel.location.PlaceCategory;
import alt_t.truvel.location.domain.entity.Location;
import alt_t.truvel.location.domain.repository.LocationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceUnitTest {

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private LocationRepository locationRepository;

    @InjectMocks
    private ScheduleService scheduleService;

    private DaySchedule mockDaySchedule;
    private Location mockLocation1;
    private Location mockLocation2;
    private PlaceCategory mockPlaceCategory;

    @BeforeEach
    void setUp() {
        mockDaySchedule = mock(DaySchedule.class);

        mockLocation1 = mock(Location.class);

        mockLocation2 = mock(Location.class);

        mockPlaceCategory = PlaceCategory.ATTRACTION; // Use a real enum value
    }

    @Test
    @DisplayName("스케줄 생성 - 성공 (stayTime 자동 설정 포함)")
    void createSchedule() {
        // Given
        ScheduleRequest request1 = new ScheduleRequest("Location A", 1, PreferTime.Morning, "Memo A", Duration.ofHours(1));
        ScheduleRequest request2 = new ScheduleRequest("Location B", 2, PreferTime.Afternoon, "Memo B", null); // stayTime is null

        List<ScheduleRequest> scheduleRequests = List.of(request1, request2);


        when(locationRepository.findByName("Location A")).thenReturn(Optional.of(mockLocation1));
        when(locationRepository.findByName("Location B")).thenReturn(Optional.of(mockLocation2));

        // Mock behavior for Location B's category to provide a default stayTime
        when(mockLocation2.getCategory()).thenReturn(mockPlaceCategory); // Use the real enum

        // Capture the list of schedules passed to saveAll
        ArgumentCaptor<List<Schedule>> schedulesCaptor = ArgumentCaptor.forClass(List.class);
        when(scheduleRepository.saveAll(schedulesCaptor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        List<Schedule> createdSchedules = scheduleService.createSchedule(mockDaySchedule, scheduleRequests);

        // Then
        assertNotNull(createdSchedules);
        assertEquals(2, createdSchedules.size());

        // Verify request1's schedule
        Schedule schedule1 = createdSchedules.get(0);
        assertEquals(mockDaySchedule, schedule1.getDaySchedule());
        assertEquals(mockLocation1, schedule1.getLocation());
        assertEquals(request1.getStayTime(), schedule1.getStayTime()); // Should be the one from request

        // Verify request2's schedule (with auto-set stayTime)
        Schedule schedule2 = createdSchedules.get(1);
        assertEquals(mockDaySchedule, schedule2.getDaySchedule());
        assertEquals(mockLocation2, schedule2.getLocation());
        assertEquals(mockPlaceCategory.getStayTime(), schedule2.getStayTime()); // Should be auto-set from category

        // Verify interactions
        verify(locationRepository, times(1)).findByName("Location A");
        verify(locationRepository, times(1)).findByName("Location B");
        verify(scheduleRepository, times(1)).saveAll(anyList());
        verify(mockDaySchedule, times(1)).updateSchedules(anyList());

        // Further verify the content of the list passed to saveAll
        List<Schedule> capturedList = schedulesCaptor.getValue();
        assertEquals(2, capturedList.size());
        assertEquals(schedule1, capturedList.get(0));
        assertEquals(schedule2, capturedList.get(1));
    }

    @Test
    @DisplayName("스케줄 생성 - 실패 (Location을 찾을 수 없음)")
    void createSchedule_Failure_LocationNotFound() {
        // Given
        ScheduleRequest request1 = new ScheduleRequest("Location A", 1, PreferTime.Morning, "Memo A", Duration.ofHours(1));
        ScheduleRequest request2 = new ScheduleRequest("NonExistent Location", 2, PreferTime.Afternoon, "Memo B", null);

        List<ScheduleRequest> scheduleRequests = List.of(request1, request2);

        when(locationRepository.findByName("Location A")).thenReturn(Optional.of(mockLocation1));
        when(locationRepository.findByName("NonExistent Location")).thenReturn(Optional.empty());

        // When / Then
        NoSuchElementException thrown = assertThrows(NoSuchElementException.class, () -> {
            scheduleService.createSchedule(mockDaySchedule, scheduleRequests);
        });

        assertTrue(thrown.getMessage().contains("NonExistent Location"));

        // Verify interactions
        verify(locationRepository, times(1)).findByName("Location A");
        verify(locationRepository, times(1)).findByName("NonExistent Location");
        verify(scheduleRepository, never()).saveAll(anyList()); // Should not be called
        verify(mockDaySchedule, never()).updateSchedules(anyList()); // Should not be called
    }

    @Test
    @DisplayName("스케줄 생성 - 빈 요청 리스트")
    void createSchedule_EmptyRequestList() {
        // Given
        List<ScheduleRequest> scheduleRequests = new ArrayList<>();

        // When
        List<Schedule> createdSchedules = scheduleService.createSchedule(mockDaySchedule, scheduleRequests);

        // Then
        assertNotNull(createdSchedules);
        assertTrue(createdSchedules.isEmpty());

        // 메서드 호출 시 전달되는 인자의 내부 상태
        ArgumentCaptor<List<Schedule>> captor = ArgumentCaptor.forClass(List.class);

        verify(locationRepository, never()).findByName(anyString());
        verify(scheduleRepository, times(1)).saveAll(captor.capture());
        verify(mockDaySchedule, times(1)).updateSchedules(anyList());

        // Verify that the captured list is indeed empty
        assertTrue(captor.getValue().isEmpty());
    }
}