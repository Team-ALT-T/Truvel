package alt_t.truvel.config;

import alt_t.truvel.searchCountryAndCity.dto.CityDto;
import alt_t.truvel.searchCountryAndCity.dto.CountryCityData;
import alt_t.truvel.searchCountryAndCity.dto.CountryDto;
import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * spring 서버가 실행된 후 국가와 나라 데이터를 초기화
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ObjectMapper objectMapper;
    private final CountryRepository countryRepository;
    private final CityRepository cityRepository;

    /**
     *
     * @param args incoming main method arguments : CountriesAndCities 데이터
     * @throws Exception
     */
    @Override
    public void run(String... args) throws Exception {
        // 시작될 조건을 명시
        if (countryRepository.count() == 0 && cityRepository.count() == 0) {
            System.out.println("국가 및 도시 데이터 초기화를 시작...");

            // 입력될 데이터의 경로를 명시
            InputStream inputStream = new ClassPathResource("data/CountriesAndCities.json").getInputStream();
            // CountriesAndCities에서 값을 읽어들임
            CountryCityData data = objectMapper.readValue(inputStream, CountryCityData.class);

            // 해쉬맵을 통해 country들을 저장해둠
            Map<Integer, Country> countryMap = new HashMap<>();

            int countryIdCounter = 1;
            // country 필드의 갯수만큼 반복하여 db에 저장
            for (CountryDto dto : data.getCountries()) {
                Country country = new Country(dto.getKorean(), dto.getEnglish());
                Country savedCountry = countryRepository.save(country);
                countryMap.put(countryIdCounter++, savedCountry);
            }
            // city 필드의 갯수만큼 반복하여 db에 저장
            for (CityDto dto : data.getCities()) {
                Country associatedCountry = countryMap.get(dto.getCountryId());
                if (associatedCountry != null) {
                    City city = new City(dto.getKorean(), dto.getEnglish(), associatedCountry);
                    cityRepository.save(city);
                } else {
                    System.err.println("경고: countryId " + dto.getCountryId() + "에 해당하는 Country를 찾을 수 없습니다. City: " + dto.getKorean());
                }
            }
            System.out.println("국가 및 도시 데이터 초기화가 완료되었습니다.");
        } else {
            System.out.println("국가 및 도시 데이터가 이미 존재하여 초기화를 건너뛰었습니다.");
        }
    }
}