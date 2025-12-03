package alt_t.truvel.searchCountryAndCity.service;

import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import alt_t.truvel.searchCountryAndCity.dto.CitySearchResponse;
import alt_t.truvel.searchCountryAndCity.dto.CountrySearchResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import java.util.List;
import java.util.Objects;

import static alt_t.truvel.searchCountryAndCity.service.CountryAndCitySearchService.CITY_RANK_KEY;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest
@ActiveProfiles("test")
class CountryAndCitySearchServiceTest {
    @MockitoSpyBean
    private CityRepository cityRepository;
    @Autowired
    private CountryAndCitySearchService countryAndCitySearchService;
    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private RedisTemplate<String, Long> popularityRedisTemplate;

    @Autowired
    private CacheManager cacheManager; // 캐시 관리를 위해 의존성 추가

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        LettuceConnectionFactory factory = new LettuceConnectionFactory("localhost", 6379);
        factory.setDatabase(15);  // 테스트 DB
        factory.afterPropertiesSet(); // 필수
        return factory;
    }

    @BeforeEach
    void setUp() {
        Objects.requireNonNull(cacheManager.getCache("top30Cities")).clear();
        popularityRedisTemplate.setConnectionFactory(redisConnectionFactory());
        // 각 테스트 실행 전에 Redis 테스트 DB 초기화
        popularityRedisTemplate.getConnectionFactory().getConnection().serverCommands().flushDb();
    }

    @Test
    @DisplayName("국가명으로 국가 조회 테스트")
    public void findCountriesByName(){
        List<CountrySearchResponse> countrySearchResponses = countryAndCitySearchService.searchCountries("일본");
        countrySearchResponses.forEach(System.out::println);
        assertFalse(countrySearchResponses.isEmpty());
    }

    @Test
    @DisplayName("인기도 상위 도시 조회 및 캐시 동작 테스트")
    public void findCitiesByPopularity_WithRedisData_And_Cache() {
        // given: 테스트 데이터 준비
        // 1. 테스트용 국가 및 도시 엔티티를 생성하고 DB에 저장합니다.
        Country testCountry = countryRepository.save(new Country("테스트국가", "Test Country"));
        City cityA = cityRepository.save(new City("테스트도시A", "Test City A", testCountry));
        City cityB = cityRepository.save(new City("테스트도시B", "Test City B", testCountry));
        City cityC = cityRepository.save(new City("테스트도시C", "Test City C", testCountry));

        // 2. Redis의 ZSet(ranking:city)에 인기도 점수를 저장합니다. (예상 순위: C > A > B)
        popularityRedisTemplate.opsForZSet().add(CITY_RANK_KEY, cityA.getId(), 80.0);
        popularityRedisTemplate.opsForZSet().add(CITY_RANK_KEY, cityB.getId(), 50.0);
        popularityRedisTemplate.opsForZSet().add(CITY_RANK_KEY, cityC.getId(), 100.0);

        // when: 1. 인기도가 높은 상위 도시 목록을 조회합니다. (첫 호출)
        List<CitySearchResponse> topCities = countryAndCitySearchService.getTop30CitiesByPopularity();

        // then: 1. 결과 검증
        // 3개의 도시가 모두 조회되었는지 확인합니다.
        assertEquals(3, topCities.size());
        // Redis에 저장된 인기도 점수 순서(C > A > B)대로 정렬되었는지 확인합니다.
        assertEquals("테스트도시C", topCities.get(0).getKorean());
        assertEquals("테스트도시A", topCities.get(1).getKorean());
        assertEquals("테스트도시B", topCities.get(2).getKorean());

        // when: 2. 동일한 메서드를 다시 호출합니다. (캐시 조회를 기대)
        List<CitySearchResponse> cachedTopCities = countryAndCitySearchService.getTop30CitiesByPopularity();

        // then: 2. 캐시 결과 검증
        // 캐시된 결과가 이전 결과와 동일한지 확인합니다.
        assertEquals(3, cachedTopCities.size());
        assertEquals("테스트도시C", cachedTopCities.get(0).getKorean());
        verify(cityRepository, times(1)).findAllById(Mockito.any());
    }

    @Test
    @DisplayName("인기도 증가 동시성 테스트")
    public void increasePopularityConcurrencyTest() throws InterruptedException {
        // given
        List<Country> country = countryRepository.findByKoreanContainingIgnoreCase("일본");
        Country country1 = country.get(0);

        // 조회 전 인기도 : 0
        Long beforePopularity = country1.getPopularity();

        int threadCount = 100;
        Thread[] threads = new Thread[threadCount];

        // when
        for (int i = 0; i < threadCount; i++) {
            threads[i] = new Thread(() -> {
                countryAndCitySearchService.searchCountries("일본");
            });
            threads[i].start();
        }

        for (int i = 0; i < threadCount; i++) {
            threads[i].join();
        }

        // then
        Long afterPopularity = Objects.requireNonNull(popularityRedisTemplate.opsForZSet().score("ranking:country", country1.getId())).longValue();
        System.out.println("beforePopularity = " + beforePopularity);
        System.out.println("afterPopularity = " + afterPopularity);
        assertEquals(beforePopularity + threadCount, afterPopularity);
    }
}