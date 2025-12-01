package alt_t.truvel.searchCountryAndCity.service;

import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

import static alt_t.truvel.searchCountryAndCity.service.CountryAndCitySearchService.CITY_RANK_KEY;
import static alt_t.truvel.searchCountryAndCity.service.CountryAndCitySearchService.COUNTRY_RANK_KEY;

@Component
@RequiredArgsConstructor
public class CacheUpdater {
    private final CountryAndCitySearchService countryAndCitySearchService;
    private final CacheManager cacheManager;
    private final RedisTemplate<String, Long> popularityRedisTemplate;

    @Scheduled(cron = "0 0 0 * * ?")
    public void updateTop30CitiesCache() {
        List<City> top30Cities = countryAndCitySearchService.getTop30CitiesByPopularity();


        top30Cities.forEach(city -> {
            Long score = Optional.ofNullable(popularityRedisTemplate.opsForZSet().score(CITY_RANK_KEY, city.getId()))
                    .orElse(0.0)
                    .longValue();
            city.incrementPopularity(score);
        });

        // CacheManager로 직접 캐시 저장
        Cache cache = cacheManager.getCache("top30Cities");
        if (cache != null) {
            cache.put("top30Cities", top30Cities);
        }
    }
}
