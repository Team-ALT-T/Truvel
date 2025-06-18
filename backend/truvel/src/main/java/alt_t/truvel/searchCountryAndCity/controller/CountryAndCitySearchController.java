package alt_t.truvel.searchCountryAndCity.controller;

import alt_t.truvel.searchCountryAndCity.dto.CitySearchResponse;
import alt_t.truvel.searchCountryAndCity.service.CountryAndCitySearchService;
import alt_t.truvel.searchCountryAndCity.dto.CountrySearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CountryAndCitySearchController {

    private final CountryAndCitySearchService countryAndCitySearchService; // 서비스 주입


    /**
     * 국가를 검색하는 메서드
     * @param keyword : 사용자가 입력한 국가 이름
     * @return : 검색된 국가들을 리스트 형태로 반환
     */
    @GetMapping("/search/countries")
    public ResponseEntity<List<CountrySearchResponse>> searchCountries(@RequestParam(required = false) String keyword) {
        List<CountrySearchResponse> countries = countryAndCitySearchService.searchCountries(keyword);
        return ResponseEntity.ok(countries);
    }


    /**
     *
     * @param countryId : 이전 단계에서 국가 검색 후 응답으로 나온 국가 아이디
     * @param keyword : 사용자가 입력한 도시 이름
     * @return : 검색된 도시를 리스트 형태로 반환
     */
    @GetMapping("/search/cities")
    public ResponseEntity<List<CitySearchResponse>> searchCities(
            @RequestParam(required = false) Long countryId,
            @RequestParam(required = false) String keyword) {
        List<CitySearchResponse> cities = countryAndCitySearchService.searchCities(countryId, keyword);
        return ResponseEntity.ok(cities);
    }
}

