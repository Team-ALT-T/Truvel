package alt_t.truvel.searchCountryAndCity.service;


import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import alt_t.truvel.searchCountryAndCity.dto.CountrySearchResponse;
import alt_t.truvel.searchCountryAndCity.dto.CitySearchResponse;
import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class CountryAndCitySearchService {

    private final CityRepository cityRepository;
    private final CountryRepository countryRepository;
    private final RedisTemplate<String, Long> popularityRedisTemplate;
    private final PopularityService popularityService;

    static final String COUNTRY_RANK_KEY = "ranking:country";
    static final String CITY_RANK_KEY = "ranking:city";

    /**
     * 국가를 검색하는 메서드
     * @param keyword : 사용자가 입력한 국가 이름
     * @return :
     */
    @Cacheable(value = "countries", key = "#keyword")
    public List<CountrySearchResponse> searchCountries(String keyword) {
        List<Country> countries;

        // 키워드가 없으면 인기도가 높은 30개 국가 반환
        if (keyword == null || keyword.trim().isEmpty()) {
            countries = countryRepository.findTop100ByOrderByPopularityDesc();

            // 키워드가 있으면 검색 로직
        } else {
            countries = countryRepository.findByKoreanContainingIgnoreCase(keyword);

            // 국가를 한글 이름으로 못찾으면 영어 이름으로 다시 시도
            if (countries.isEmpty()) {
                countries = countryRepository.findByEnglishContainingIgnoreCase(keyword);
            }
            return countries.stream()
                    .peek(country ->
                            popularityService.incrementPopularity(country.getId(), COUNTRY_RANK_KEY))
                    .map(CountrySearchResponse::new)
                    .toList();
        }
        // 검색된 모든 요소들을 리스트 형태로 반환
        return countries.stream()
                .map(CountrySearchResponse::new)
                .toList();
    }

    /**
     * 도시를 검색하는 메서드
     * @param countryId : 이전에 검색된 국가의 아이디
     * @param keyword : 사용자가 입력한 키워드
     * @return : 검색된 도시들을 리스트 형태로 반환
     */
    @Cacheable(value = "cities", key = "#countryId + '-' + #keyword")
    public List<CitySearchResponse> searchCities(Long countryId, String keyword) {

        List<City> cities;

        // countryId가 null이 아닐때 검색 로직 수행
        if (countryId != null) {
            // 특정 국가 내에서 도시 검색 (CountryId를 통해 조회)
            // 키워드가 없는 경우
            if (keyword == null || keyword.trim().isEmpty()) {
                cities = cityRepository.findByCountryId(countryId); // countryId로만 도시들을 가져옴
            }
            else { // 한국명으로 도시를 검색
                cities = cityRepository.findByCountryIdAndKoreanContainingIgnoreCase(countryId, keyword);
                if (cities.isEmpty()) { // 만일 cities가 비어있으면 영어명으로 도시 검색을 재시도
                    cities = cityRepository.findByCountryIdAndEnglishContainingIgnoreCase(countryId, keyword);
                }
                return cities.stream()
                        .peek(city ->
                                popularityService.incrementPopularity(city.getId(), CITY_RANK_KEY))
                        .map(CitySearchResponse::from)
                        .toList();
            }
        }
        // countryId가 없는 경우: 모든 도시에서 키워드 검색
        else {
            // 키워드가 없는 경우
            if (keyword == null || keyword.trim().isEmpty()) {
                cities = cityRepository.findTop100ByOrderByPopularityDesc(); // 모든 도시
            }
            else {
                cities = cityRepository.findByKoreanContainingIgnoreCase(keyword);
                if (cities.isEmpty()) {
                    cities = cityRepository.findByEnglishContainingIgnoreCase(keyword);
                }
                return cities.stream()
                        .peek(city ->
                                popularityService.incrementPopularity(city.getId(), CITY_RANK_KEY))
                        .map(CitySearchResponse::from)
                        .toList();
            }
        }
        return cities.stream()
                .map(CitySearchResponse::from)
                .toList();
    }

    /**
     * 인기도가 높은 상위 30개 도시를 반환하는 메서드
     * @return : 인기도가 높은 30개 도시 리스트
     */
    @Cacheable(value = "top30Cities", key = "'top30Cities'")
    public List<CitySearchResponse> getTop30CitiesByPopularity() {
        // Redis에서 상위 30개 cityId 조회
        Set<ZSetOperations.TypedTuple<Long>> top30Cities =
                popularityRedisTemplate.opsForZSet().reverseRangeWithScores(CITY_RANK_KEY, 0, 29);

        if (top30Cities == null || top30Cities.isEmpty()) {
            // Redis가 비어있으면
            return cityRepository.findAll(
                    PageRequest.of(
                            0,
                            30,
                            Sort.by(Sort.Direction.DESC, "popularity")
                    )).getContent().stream()
                    .map(CitySearchResponse::from).toList();
        }
        // cityId를 Long으로 변환
        List<Long> cityIds = sortedSetToIdList(top30Cities);

        // DB에서 City 엔티티 조회
        List<City> cities = cityRepository.findAllById(cityIds);

        // Redis를 거치지 않으면 실시간 성을 보장할 수 없다.
        // Redis 순서대로 정렬 (ZSet 순서 보장)
        Map<Long, City> cityMap = cities.stream()
                .collect(Collectors.toMap(City::getId, Function.identity()));

        return cityIds.stream()
                .map(cityMap::get)
                .filter(Objects::nonNull)
                .map(CitySearchResponse::from)
                .toList();
    }

    public static List<Long> sortedSetToIdList(Set<ZSetOperations.TypedTuple<Long>> cities){
        return cities.stream()
                .map(ZSetOperations.TypedTuple::getValue)
                .toList();
    }
}