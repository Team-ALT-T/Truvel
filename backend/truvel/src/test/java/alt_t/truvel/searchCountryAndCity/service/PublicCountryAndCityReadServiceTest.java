package alt_t.truvel.searchCountryAndCity.service;

import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicCountryAndCityReadServiceTest {

    @Mock
    private CityRepository cityRepository;

    @Mock
    private CountryRepository countryRepository;

    @InjectMocks
    private PublicCountryAndCityReadService publicCountryAndCityReadService;

    @Test
    void trimsKeywordAndLimitsCountryResultsAtRepositoryAndResponse() {
        List<Country> countries = IntStream.range(0, 101)
                .mapToObj(index -> new Country("대한민국" + index, "Korea" + index))
                .toList();
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        when(countryRepository.findByKoreanContainingIgnoreCase(eq("대한민국"), pageableCaptor.capture()))
                .thenReturn(countries);

        var result = publicCountryAndCityReadService.getCountries("  대한민국  ");

        assertThat(result).hasSize(PublicCountryAndCityReadService.MAX_RESULTS);
        assertThat(pageableCaptor.getValue().getPageSize())
                .isEqualTo(PublicCountryAndCityReadService.MAX_RESULTS);
    }

    @Test
    void limitsAllCitiesForCountryAtRepositoryAndResponse() {
        Country country = new Country("대한민국", "Korea");
        List<City> cities = IntStream.range(0, 101)
                .mapToObj(index -> new City("도시" + index, "City" + index, country))
                .toList();
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        when(cityRepository.findByCountryId(eq(1L), pageableCaptor.capture()))
                .thenReturn(cities);

        var result = publicCountryAndCityReadService.getCities(1L, "  ");

        assertThat(result).hasSize(PublicCountryAndCityReadService.MAX_RESULTS);
        assertThat(pageableCaptor.getValue().getPageSize())
                .isEqualTo(PublicCountryAndCityReadService.MAX_RESULTS);
    }

    @Test
    void rejectsKeywordsLongerThanFiftyCharacters() {
        String longKeyword = "가".repeat(PublicCountryAndCityReadService.MAX_KEYWORD_LENGTH + 1);

        assertThatThrownBy(() -> publicCountryAndCityReadService.getCountries(longKeyword))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("keyword는 최대 50자까지 입력할 수 있습니다.");
        assertThatThrownBy(() -> publicCountryAndCityReadService.getCities(null, longKeyword))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("keyword는 최대 50자까지 입력할 수 있습니다.");
    }
}
