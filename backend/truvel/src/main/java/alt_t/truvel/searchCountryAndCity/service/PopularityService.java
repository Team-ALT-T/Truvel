package alt_t.truvel.searchCountryAndCity.service;


import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PopularityService {
    private final RedisTemplate<String, Long> popularityRedisTemplate;

    /**
     * 사용자가 도시를 조회하거나 예약할 때 인기도 점수 증가
     */
    public void incrementPopularity(Long id, String key) {
        popularityRedisTemplate.opsForZSet().incrementScore(
                key, // COUNTRY_RANK_KEY or CITY_RANK_KEY
                id,  // member = cityId
                1    // 점수 증가량
        );
    }

}
