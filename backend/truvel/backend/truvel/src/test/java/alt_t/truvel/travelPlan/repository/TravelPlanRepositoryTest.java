package alt_t.truvel.travelPlan.repository;

import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.auth.user.domain.repository.UserRepository;
import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class TravelPlanRepositoryTest {

    @Autowired
    private TravelPlanRepository travelPlanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private CityRepository cityRepository;

    private User user;
    private TravelPlan travelPlan;

    @BeforeEach
    void setUp() {
        user = userRepository.save(User.builder().nickname("tester").email("tester@test.com").password("password").build());
        Country country = countryRepository.save(Country.builder().korean("한국").english("Korea").build());
        City city = cityRepository.save(City.builder().korean("서울").english("Seoul").country(country).build());

        travelPlan = TravelPlan.builder()
                .user(user)
                .nationId(country)
                .cityId(city)
                .nationName(country.getKorean())
                .cityName(city.getKorean())
                .build();
        travelPlanRepository.save(travelPlan);
    }

    @AfterEach
    void tearDown() {
        travelPlanRepository.deleteAll();
        cityRepository.deleteAll();
        countryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("사용자 ID로 여행 계획 목록 조회")
    void findByUserId() {
        // given (in setUp)

        // when
        List<TravelPlan> foundTravelPlans = travelPlanRepository.findByUserId(user.getId());

        // then
        assertNotNull(foundTravelPlans);
        assertEquals(1, foundTravelPlans.size());
        assertEquals(travelPlan.getId(), foundTravelPlans.get(0).getId());
        assertEquals(user.getId(), foundTravelPlans.get(0).getUser().getId());
    }
}