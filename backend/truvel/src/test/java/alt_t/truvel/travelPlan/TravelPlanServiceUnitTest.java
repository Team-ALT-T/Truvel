package alt_t.truvel.travelPlan;

import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.auth.user.domain.repository.UserRepository;
import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import alt_t.truvel.travelPlan.dto.TravelPlanRequest;
import alt_t.truvel.travelPlan.dto.TravelPlanResponse;
import alt_t.truvel.travelPlan.service.TravelPlanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * TravelPlanService의 단위 테스트 - Mock을 사용하여 의존성을 격리
 */
@ExtendWith(MockitoExtension.class)
class TravelPlanServiceUnitTest {

    @Mock
    private TravelPlanRepository travelPlanRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CountryRepository countryRepository;

    @Mock
    private CityRepository cityRepository;

    @InjectMocks
    private TravelPlanService travelPlanService;

    // 테스트용 데이터
    private User mockUser;
    private Country mockCountry;
    private City mockCity;
    private TravelPlan mockTravelPlan;
    private TravelPlanRequest mockRequest;

    @BeforeEach
    void setUp() {
        // Mock 객체들 초기화
        mockUser = User.builder()
                .email("test@example.com")
                .password("password123")
                .nickname("testUser")
                .build();

        mockCountry = new Country("대한민국", "Korea");
        mockCity = new City("서울", "Seoul", mockCountry);

        mockRequest = new TravelPlanRequest(
                1L, // countryId
                1L, // cityId
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2025, 1, 5)
        );

        mockTravelPlan = TravelPlan.builder()
                .id(1L)
                .nationId(mockCountry)
                .cityId(mockCity)
                .cityName("서울")
                .nationName("대한민국")
                .startDate(LocalDate.of(2025, 1, 1))
                .endDate(LocalDate.of(2025, 1, 5))
                .user(mockUser)
                .build();
    }

    @Test
    @DisplayName("여행 일정 생성 성공 테스트")
    void createTravelPlan_Success() {
        // given
        Long userId = 1L;
        given(userRepository.findById(userId)).willReturn(Optional.of(mockUser));
        given(countryRepository.findById(1L)).willReturn(Optional.of(mockCountry));
        given(cityRepository.findById(1L)).willReturn(Optional.of(mockCity));
        given(travelPlanRepository.save(any(TravelPlan.class))).willReturn(mockTravelPlan);

        // when
        TravelPlanResponse response = travelPlanService.createTravelPlan(userId, mockRequest);

        // then
        assertThat(response.getMessage()).isEqualTo("여행 일정이 생성되었습니다");
        assertThat(response.getTravelPlanId()).isEqualTo(1L);

        verify(userRepository).findById(userId);
        verify(countryRepository).findById(1L);
        verify(cityRepository).findById(1L);
        verify(travelPlanRepository).save(any(TravelPlan.class));
    }

    @Test
    @DisplayName("여행 일정 생성 실패 - 사용자를 찾을 수 없음")
    void createTravelPlan_UserNotFound() {
        // given
        Long userId = 999L;
        given(userRepository.findById(userId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> travelPlanService.createTravelPlan(userId, mockRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("사용자를 찾을 수 없습니다.");

        verify(userRepository).findById(userId);
        verify(countryRepository, never()).findById(anyLong());
        verify(cityRepository, never()).findById(anyLong());
        verify(travelPlanRepository, never()).save(any(TravelPlan.class));
    }

    @Test
    @DisplayName("여행 일정 생성 실패 - 국가를 찾을 수 없음")
    void createTravelPlan_CountryNotFound() {
        // given
        Long userId = 1L;
        Long countryId = 999L;
        TravelPlanRequest requestWithInvalidCountry = new TravelPlanRequest(
                countryId, 1L, LocalDate.of(2025, 1, 1), LocalDate.of(2025, 1, 5)
        );

        given(userRepository.findById(userId)).willReturn(Optional.of(mockUser));
        given(countryRepository.findById(countryId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> travelPlanService.createTravelPlan(userId, requestWithInvalidCountry))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage("Country not found with ID: " + countryId);

        verify(userRepository).findById(userId);
        verify(countryRepository).findById(countryId);
        verify(cityRepository, never()).findById(anyLong());
        verify(travelPlanRepository, never()).save(any(TravelPlan.class));
    }

    @Test
    @DisplayName("여행 일정 생성 실패 - 도시를 찾을 수 없음")
    void createTravelPlan_CityNotFound() {
        // given
        Long userId = 1L;
        Long cityId = 999L;
        TravelPlanRequest requestWithInvalidCity = new TravelPlanRequest(
                1L, cityId, LocalDate.of(2025, 1, 1), LocalDate.of(2025, 1, 5)
        );

        given(userRepository.findById(userId)).willReturn(Optional.of(mockUser));
        given(countryRepository.findById(1L)).willReturn(Optional.of(mockCountry));
        given(cityRepository.findById(cityId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> travelPlanService.createTravelPlan(userId, requestWithInvalidCity))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage("City not found with ID: " + cityId);

        verify(userRepository).findById(userId);
        verify(countryRepository).findById(1L);
        verify(cityRepository).findById(cityId);
        verify(travelPlanRepository, never()).save(any(TravelPlan.class));
    }

    @Test
    @DisplayName("여행 일정 목록 조회 성공 테스트")
    void getTravelPlans_Success() {
        // given
        Long userId = 1L;
        TravelPlan travelPlan2 = TravelPlan.builder()
                .id(2L)
                .nationId(mockCountry)
                .cityId(mockCity)
                .cityName("서울")
                .nationName("대한민국")
                .startDate(LocalDate.of(2025, 2, 1))
                .endDate(LocalDate.of(2025, 2, 5))
                .user(mockUser)
                .build();

        List<TravelPlan> travelPlans = Arrays.asList(mockTravelPlan, travelPlan2);

        given(userRepository.findById(userId)).willReturn(Optional.of(mockUser));
        given(travelPlanRepository.findByUserId(userId)).willReturn(travelPlans);

        // when
        List<TravelPlanResponse> responses = travelPlanService.getTravelPlans(userId);

        // then
        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).getTravelPlanId()).isEqualTo(1L);
        assertThat(responses.get(0).getCountryName()).isEqualTo("대한민국");
        assertThat(responses.get(0).getCityName()).isEqualTo("서울");
        assertThat(responses.get(1).getTravelPlanId()).isEqualTo(2L);

        verify(userRepository).findById(userId);
        verify(travelPlanRepository).findByUserId(userId);
    }

    @Test
    @DisplayName("여행 일정 목록 조회 실패 - 사용자를 찾을 수 없음")
    void getTravelPlans_UserNotFound() {
        // given
        Long userId = 999L;
        given(userRepository.findById(userId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> travelPlanService.getTravelPlans(userId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("사용자를 찾을 수 없습니다.");

        verify(userRepository).findById(userId);
        verify(travelPlanRepository, never()).findByUserId(anyLong());
    }

    @Test
    @DisplayName("여행 일정 단건 조회 성공 테스트")
    void getTravelPlan_Success() {
        // given
        Long userId = 1L;
        Long travelPlanId = 1L;

        given(userRepository.findById(userId)).willReturn(Optional.of(mockUser));
        given(travelPlanRepository.findById(travelPlanId)).willReturn(Optional.of(mockTravelPlan));

        // when
        TravelPlanResponse response = travelPlanService.getTravelPlan(userId, travelPlanId);

        // then
        assertThat(response.getMessage()).isEqualTo("여행 일정 단건 조회 성공");
        assertThat(response.getTravelPlanId()).isEqualTo(1L);
        assertThat(response.getStartDate()).isEqualTo(LocalDate.of(2025, 1, 1));
        assertThat(response.getEndDate()).isEqualTo(LocalDate.of(2025, 1, 5));
        assertThat(response.getCountryName()).isEqualTo("대한민국");
        assertThat(response.getCityName()).isEqualTo("서울");

        verify(userRepository).findById(userId);
        verify(travelPlanRepository).findById(travelPlanId);
    }

    @Test
    @DisplayName("여행 일정 단건 조회 실패 - 사용자를 찾을 수 없음")
    void getTravelPlan_UserNotFound() {
        // given
        Long userId = 999L;
        Long travelPlanId = 1L;
        given(userRepository.findById(userId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> travelPlanService.getTravelPlan(userId, travelPlanId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("사용자를 찾을 수 없습니다.");

        verify(userRepository).findById(userId);
        verify(travelPlanRepository, never()).findById(anyLong());
    }

    @Test
    @DisplayName("여행 일정 단건 조회 실패 - 여행 일정을 찾을 수 없음")
    void getTravelPlan_TravelPlanNotFound() {
        // given
        Long userId = 1L;
        Long travelPlanId = 999L;

        given(userRepository.findById(userId)).willReturn(Optional.of(mockUser));
        given(travelPlanRepository.findById(travelPlanId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> travelPlanService.getTravelPlan(userId, travelPlanId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("여행 일정을 찾을 수 없습니다.");

        verify(userRepository).findById(userId);
        verify(travelPlanRepository).findById(travelPlanId);
    }
}
