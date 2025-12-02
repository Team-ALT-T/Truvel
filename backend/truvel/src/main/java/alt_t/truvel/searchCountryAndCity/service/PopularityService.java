package alt_t.truvel.searchCountryAndCity.service;


import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static alt_t.truvel.searchCountryAndCity.service.CountryAndCitySearchService.*;

@Service
@RequiredArgsConstructor
public class PopularityService {
    private final RedisTemplate<String, Long> popularityRedisTemplate;
    private final CityRepository cityRepository;

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
    /**
     * [스케줄러용] Redis의 인기도 점수를 DB에 반영하고 Redis 랭킹을 초기화하는 메서드
     */
    @Transactional
    @Scheduled(cron = "0 0 0 * * ?")
    public void applyPopularityToDbAndReset() {
        // 1. Redis에서 모든 도시의 인기도 점수를 가져옵니다.
        Set<ZSetOperations.TypedTuple<Long>> cityScores = popularityRedisTemplate.opsForZSet().rangeWithScores(CITY_RANK_KEY, 0, -1);

        if (cityScores == null || cityScores.isEmpty()) {
            return; // 업데이트할 내용이 없으면 종료
        }

        // 2. 도시 ID 목록을 추출하고, 해당 도시 엔티티들을 DB에서 한번에 조회합니다.
        List<Long> cityIds = sortedSetToIdList(cityScores);
        List<City> cities = cityRepository.findAllById(cityIds);
        Map<Long, City> cityMap = cities.stream().collect(Collectors.toMap(City::getId, Function.identity()));

        // 3. 각 도시의 인기도를 DB에 반영(업데이트)합니다.
        cityScores.forEach(tuple -> {
            City city = cityMap.get(tuple.getValue());
            Double score = tuple.getScore();
            if (city != null && score != null) {
                city.incrementPopularity(score.longValue());
            }
        });

        // 4. 처리가 완료된 Redis의 랭킹 데이터를 삭제합니다.
        popularityRedisTemplate.delete(List.of(CITY_RANK_KEY, COUNTRY_RANK_KEY));
    }

}
