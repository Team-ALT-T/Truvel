package alt_t.truvel.searchCountryAndCity.service;

import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import alt_t.truvel.searchCountryAndCity.dto.CitySearchResponse;
import alt_t.truvel.searchCountryAndCity.dto.CountrySearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicCountryAndCityReadService {

    static final int MAX_KEYWORD_LENGTH = 50;
    static final int MAX_RESULTS = 100;
    private static final Pageable PUBLIC_RESULT_LIMIT = PageRequest.of(0, MAX_RESULTS);

    private final CityRepository cityRepository;
    private final CountryRepository countryRepository;

    public List<CountrySearchResponse> getCountries(String keyword) {
        String normalizedKeyword = normalizeKeyword(keyword);
        List<Country> countries;

        if (normalizedKeyword == null) {
            countries = countryRepository.findTop100ByOrderByPopularityDesc();
        } else {
            countries = countryRepository.findByKoreanContainingIgnoreCase(normalizedKeyword, PUBLIC_RESULT_LIMIT);
            if (countries.isEmpty()) {
                countries = countryRepository.findByEnglishContainingIgnoreCase(normalizedKeyword, PUBLIC_RESULT_LIMIT);
            }
        }

        return countries.stream()
                .limit(MAX_RESULTS)
                .map(CountrySearchResponse::new)
                .toList();
    }

    public List<CitySearchResponse> getCities(Long countryId, String keyword) {
        String normalizedKeyword = normalizeKeyword(keyword);
        List<City> cities;

        if (countryId != null) {
            if (normalizedKeyword == null) {
                cities = cityRepository.findByCountryId(countryId, PUBLIC_RESULT_LIMIT);
            } else {
                cities = cityRepository.findByCountryIdAndKoreanContainingIgnoreCase(
                        countryId, normalizedKeyword, PUBLIC_RESULT_LIMIT);
                if (cities.isEmpty()) {
                    cities = cityRepository.findByCountryIdAndEnglishContainingIgnoreCase(
                            countryId, normalizedKeyword, PUBLIC_RESULT_LIMIT);
                }
            }
        } else if (normalizedKeyword == null) {
            cities = cityRepository.findTop100ByOrderByPopularityDesc();
        } else {
            cities = cityRepository.findByKoreanContainingIgnoreCase(normalizedKeyword, PUBLIC_RESULT_LIMIT);
            if (cities.isEmpty()) {
                cities = cityRepository.findByEnglishContainingIgnoreCase(normalizedKeyword, PUBLIC_RESULT_LIMIT);
            }
        }

        return cities.stream()
                .limit(MAX_RESULTS)
                .map(CitySearchResponse::from)
                .toList();
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return null;
        }

        String normalizedKeyword = keyword.strip();
        if (normalizedKeyword.isEmpty()) {
            return null;
        }
        if (normalizedKeyword.codePointCount(0, normalizedKeyword.length()) > MAX_KEYWORD_LENGTH) {
            throw new IllegalArgumentException("keyword는 최대 50자까지 입력할 수 있습니다.");
        }
        return normalizedKeyword;
    }
}
