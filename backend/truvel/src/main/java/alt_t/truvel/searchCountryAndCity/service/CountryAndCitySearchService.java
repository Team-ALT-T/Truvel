package alt_t.truvel.searchCountryAndCity.service;


import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import alt_t.truvel.searchCountryAndCity.dto.CountrySearchResponse;
import alt_t.truvel.searchCountryAndCity.dto.CitySearchResponse;
import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CountryAndCitySearchService {

    private final CityRepository cityRepository;
    private final CountryRepository countryRepository;


    /**
     * 국가를 검색하는 메서드
     * @param keyword : 사용자가 입력한 국가 이름
     * @return :
     */
    public List<CountrySearchResponse> searchCountries(String keyword) {
        List<Country> countries;

        // 키워드가 없으면 모든 국가 반환
        if (keyword == null || keyword.trim().isEmpty()) {
            countries = countryRepository.findAll();

            // 키워드가 있으면 검색 로직
        } else {
            countries = countryRepository.findByKoreanContainingIgnoreCase(keyword);

            // 국가를 한글 이름으로 못찾으면 영어 이름으로 다시 시도
            if (countries.isEmpty()) {
                countries = countryRepository.findByEnglishContainingIgnoreCase(keyword);
            }
        }
        // 검색된 모든 요소들을 리스트 형태로 반환
        return countries.stream()
                .map(CountrySearchResponse::from)
                .toList();
    }


    /**
     * 도시를 검색하는 메서드
     * @param countryId : 이전에 검색된 국가의 아이디
     * @param keyword : 사용자가 입력한 키워드
     * @return : 검색된 도시들을 리스트 형태로 반환
     */
    public List<CitySearchResponse> searchCities(Long countryId, String keyword) {

        List<City> cities;

        // countryId가 null이 아닐때 검색 로직 수행
        if (countryId != null) {
            // 특정 국가 내에서 도시 검색 (CountryId를 통해 조회)
            if (keyword == null || keyword.trim().isEmpty()) {
                cities = cityRepository.findByCountryId(countryId); // countryId로만 도시들을 가져옴
            } else { // 한국명으로 도시를 검색
                cities = cityRepository.findByCountryIdAndKoreanContainingIgnoreCase(countryId, keyword);
                if (cities.isEmpty()) { // 만일 cities가 비어있으면 영어명으로 도시 검색을 재시도
                    cities = cityRepository.findByCountryIdAndEnglishContainingIgnoreCase(countryId, keyword);
                }
            }
        } else {
            // countryId가 없는 경우: 모든 도시에서 키워드 검색
            if (keyword == null || keyword.trim().isEmpty()) {
                cities = cityRepository.findAll(); // 모든 도시
            } else {
                cities = cityRepository.findByKoreanContainingIgnoreCase(keyword);
                if (cities.isEmpty()) {
                    cities = cityRepository.findByEnglishContainingIgnoreCase(keyword);
                }
            }
        }
        return cities.stream()
                .map(CitySearchResponse::from)
                .toList();
    }
}