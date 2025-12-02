package alt_t.truvel.searchCountryAndCity.service;

import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import alt_t.truvel.searchCountryAndCity.dto.CountrySearchResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class CountryAndCitySearchServiceIntegrationTest {
//    @Autowired
//    private CountryAndCitySearchService countryAndCitySearchService;
//    @Autowired
//    private CountryRepository countryRepository;
//
//    @Test
//    @DisplayName("국가명으로 국가 조회 테스트")
//    public void findCountriesByName(){
//        List<CountrySearchResponse> countrySearchResponses = countryAndCitySearchService.searchCountries("일본");
//        countrySearchResponses.forEach(System.out::println);
//        assertFalse(countrySearchResponses.isEmpty());
//    }
//
//    @Test
//    @DisplayName("없는 국가명으로 국가 조회시 인기도 순으로 10개 출력 테스트")
//    public void findCountriesByName_NotFound(){
//        // 조회하여 인기도 올리기
//        countryAndCitySearchService.searchCountries("베트남");
//        countryAndCitySearchService.searchCountries("베트남");
//        countryAndCitySearchService.searchCountries("베트남");
//        countryAndCitySearchService.searchCountries("베트남");
//        countryAndCitySearchService.searchCountries("베트남");
//        countryAndCitySearchService.searchCountries("베트남");
//        countryAndCitySearchService.searchCountries("스페인");
//        countryAndCitySearchService.searchCountries("스페인");
//        countryAndCitySearchService.searchCountries("스페인");
//        countryAndCitySearchService.searchCountries("스페인");
//        countryAndCitySearchService.searchCountries("일본");
//
//        List<CountrySearchResponse> countrySearchResponses = countryAndCitySearchService.searchCountries(null);
//        countrySearchResponses.forEach(countrySearchResponse -> {
//            System.out.println("countrySearchResponse = " + countrySearchResponse.getKoreanName());
//        });
//
//        // 인기도 순으로 정렬되어서 나오는지 확인
//        assertEquals("베트남", countrySearchResponses.get(0).getKoreanName());
//        assertEquals("스페인", countrySearchResponses.get(1).getKoreanName());
//        assertEquals("일본", countrySearchResponses.get(2).getKoreanName());
//    }
//
//    @Test
//    @DisplayName("국가 조회 시 인기도 증가 테스트")
//    public void searchCountries(){
//        List<Country> country = countryRepository.findByKoreanContainingIgnoreCase("일본");
//        Country country1 = country.get(0);
//        Long beforePopularity = country1.getPopularity();
//        countryAndCitySearchService.searchCountries("일본");
//        Long afterPopularity = countryRepository.findById(country1.getId()).orElseThrow().getPopularity();
//        System.out.println("beforePopularity = " + beforePopularity);
//        System.out.println("afterPopularity = " + afterPopularity);
//        assertNotEquals(beforePopularity, afterPopularity);
//    }
//
//    @Test
//    @DisplayName("인기도 증가 동시성 테스트")
//    public void increasePopularityConcurrencyTest() throws InterruptedException {
//        // given
//        List<Country> country = countryRepository.findByKoreanContainingIgnoreCase("일본");
//        Country country1 = country.get(0);
//
//        // 조회 전 인기도 : 0
//        Long beforePopularity = country1.getPopularity();
//
//        int threadCount = 100;
//        Thread[] threads = new Thread[threadCount];
//
//        // when
//        for (int i = 0; i < threadCount; i++) {
//            threads[i] = new Thread(() -> {
//                countryAndCitySearchService.searchCountries("일본");
//            });
//            threads[i].start();
//        }
//
//        for (int i = 0; i < threadCount; i++) {
//            threads[i].join();
//        }
//
//        // then
//        Long afterPopularity = countryRepository.findById(country1.getId()).orElseThrow().getPopularity();
//        System.out.println("beforePopularity = " + beforePopularity);
//        System.out.println("afterPopularity = " + afterPopularity);
//        assertEquals(beforePopularity + threadCount, afterPopularity);
//    }
}