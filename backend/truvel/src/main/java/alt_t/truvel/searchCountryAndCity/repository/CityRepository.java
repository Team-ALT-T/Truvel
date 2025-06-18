package alt_t.truvel.searchCountryAndCity.repository;

import alt_t.truvel.searchCountryAndCity.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {

    // City 엔티티 자체의 한글 이름으로 검색
    List<City> findByKoreanContainingIgnoreCase(String keyword);

    // City 엔티티 자체의 영어 이름으로 검색
    List<City> findByEnglishContainingIgnoreCase(String keyword);

    // 특정 CountryId에 속하는 도시를 이름으로 검색 (ID를 통해 조회, Country 엔티티 직접 참조 아님)
    List<City> findByCountryIdAndKoreanContainingIgnoreCase(Long countryId, String keyword);
    List<City> findByCountryIdAndEnglishContainingIgnoreCase(Long countryId, String keyword);

    // 특정 CountryId에 속하는 모든 도시 조회
    List<City> findByCountryId(Long countryId);}
