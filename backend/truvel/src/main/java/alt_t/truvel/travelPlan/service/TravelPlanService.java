package alt_t.truvel.travelPlan.service;

import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import alt_t.truvel.travelPlan.dto.TravelPlanRequest;
import alt_t.truvel.travelPlan.dto.TravelPlanResponse;
import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.auth.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class TravelPlanService {

    private final TravelPlanRepository travelPlanRepository;
    private final UserRepository userRepository;
    private final CountryRepository countryRepository;
    private final CityRepository cityRepository;


    /**
     * 일정 생성 메서드
     * @param userId : 사용자의 아이디
     * @param request : 여행 일정 요청 DTO, CountryId와 CityId는 검색 기능을 통해 찾아와야 함!
     * @return : 응답 성공 메시지와 DB에 저장된 여행 일정의 아이디 반환
     */
    @Transactional
    public TravelPlanResponse createTravelPlan(Long userId, TravelPlanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // TravelPlanRequest에서 받은 countryId와 cityId로 실제 Country, City 엔티티를 조회
        Country nation = countryRepository.findById(request.getCountryId())
                .orElseThrow(() -> new NoSuchElementException("Country not found with ID: " + request.getCountryId()));

        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new NoSuchElementException("City not found with ID: " + request.getCityId()));

        // TravelPlanRequest의 toTravelPlan() 메서드 대신, TravelPlan.builder()를 사용하여 직접 생성
        TravelPlan travelPlan = TravelPlan.builder()
                .nationId(nation) // DB에는 country_id가 저장되어 해당 데이터 조회시 Join연산으로 가져옴
                .cityId(city) // city도 마찬가지
                .cityName(city.getKorean())
                .nationName(nation.getKorean())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .user(user)
                .build();

        user.addTravelPlan(travelPlan);

        TravelPlan savedTravelPlan = travelPlanRepository.save(travelPlan);

        return TravelPlanResponse.of("여행 일정이 생성되었습니다", savedTravelPlan.getId());
    }


    /**
     * 일정 목록 조회 메서드
     * @return
     */
    @Transactional(readOnly = true)
    public List<TravelPlanResponse> getTravelPlans(Long userId) {

        // 사용자가 있는지 검증
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 여행 일정들을 목록으로 반환
        return travelPlanRepository.findByUserId(userId)
                .stream()
                .map(travelPlan -> TravelPlanResponse.toTravelPlanList(
                        travelPlan.getId(),
                        travelPlan.getStartDate(),
                        travelPlan.getEndDate(),
                        travelPlan.getNationId().getKorean(),
                        travelPlan.getCityId().getKorean()))
                .toList();

    }


    /**
     * 여행 일정 단건 조회 메서드
     * @param travelPlanId : 여행 일정 아이디
     * @return : 여행 일정 하나를 반환
     */
    @Transactional(readOnly = true)
    public TravelPlanResponse getTravelPlan(Long travelPlanId) {

        TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId)
                .orElseThrow(() -> new IllegalArgumentException("여행 일정을 찾을 수 없습니다."));

        return TravelPlanResponse.toTravelPlan(
                "여행 일정 단건 조회 성공",
                travelPlan.getId(),
                travelPlan.getStartDate(),
                travelPlan.getEndDate(),
                travelPlan.getNationId().getKorean(),
                travelPlan.getCityId().getKorean()
        );

    }

}
