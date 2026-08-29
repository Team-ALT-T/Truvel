package alt_t.truvel.searchCountryAndCity.integration;

import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicCountryAndCityApiIntegrationTest {

    private static final String COUNTRY_KEYWORD = "공개조회테스트국가";
    private static final String CITY_KEYWORD = "공개조회테스트도시";
    private static final String COUNTRY_RANK_KEY = "ranking:country";
    private static final String CITY_RANK_KEY = "ranking:city";
    private static final double COUNTRY_BASE_SCORE = 7.0;
    private static final double CITY_BASE_SCORE = 11.0;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private RedisTemplate<String, Long> popularityRedisTemplate;

    private Country country;
    private City city;

    @BeforeEach
    void setUp() {
        cityRepository.findByKoreanContainingIgnoreCase(CITY_KEYWORD)
                .forEach(cityRepository::delete);
        countryRepository.findByKoreanContainingIgnoreCase(COUNTRY_KEYWORD)
                .forEach(countryRepository::delete);

        country = countryRepository.save(new Country(COUNTRY_KEYWORD, "Public Read Test Country"));
        city = cityRepository.save(new City(CITY_KEYWORD, "Public Read Test City", country));

        popularityRedisTemplate.opsForZSet().add(COUNTRY_RANK_KEY, country.getId(), COUNTRY_BASE_SCORE);
        popularityRedisTemplate.opsForZSet().add(CITY_RANK_KEY, city.getId(), CITY_BASE_SCORE);
    }

    @Test
    @DisplayName("공개 조회는 인증 없이 성공하고 인기도를 변경하지 않으며 기존 인증 검색은 유지된다")
    void publicReadContractAndExistingAuthenticatedSearch() throws Exception {
        mockMvc.perform(get("/public/countries"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/public/cities"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/public/countries")
                        .param("keyword", "  " + COUNTRY_KEYWORD + "  "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].countryId").value(country.getId()));

        String longKeyword = "가".repeat(51);
        mockMvc.perform(get("/public/countries").param("keyword", longKeyword))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/public/cities").param("keyword", longKeyword))
                .andExpect(status().isBadRequest());

        for (int requestCount = 0; requestCount < 3; requestCount++) {
            mockMvc.perform(get("/public/countries")
                            .param("keyword", COUNTRY_KEYWORD))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].countryId").value(country.getId()))
                    .andExpect(jsonPath("$[0].koreanName").value(COUNTRY_KEYWORD));

            mockMvc.perform(get("/public/cities")
                            .param("countryId", country.getId().toString())
                            .param("keyword", CITY_KEYWORD))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].cityId").value(city.getId()))
                    .andExpect(jsonPath("$[0].korean").value(CITY_KEYWORD));
        }

        assertThat(popularityRedisTemplate.opsForZSet().score(COUNTRY_RANK_KEY, country.getId()))
                .isEqualTo(COUNTRY_BASE_SCORE);
        assertThat(popularityRedisTemplate.opsForZSet().score(CITY_RANK_KEY, city.getId()))
                .isEqualTo(CITY_BASE_SCORE);

        mockMvc.perform(get("/countries"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/cities"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/countries")
                        .with(SecurityMockMvcRequestPostProcessors.user("test-user"))
                        .param("keyword", COUNTRY_KEYWORD))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].countryId").value(country.getId()));
        mockMvc.perform(get("/cities")
                        .with(SecurityMockMvcRequestPostProcessors.user("test-user"))
                        .param("countryId", country.getId().toString())
                        .param("keyword", CITY_KEYWORD))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].cityId").value(city.getId()));

        assertThat(popularityRedisTemplate.opsForZSet().score(COUNTRY_RANK_KEY, country.getId()))
                .isEqualTo(COUNTRY_BASE_SCORE + 1);
        assertThat(popularityRedisTemplate.opsForZSet().score(CITY_RANK_KEY, city.getId()))
                .isEqualTo(CITY_BASE_SCORE + 1);
    }
}
