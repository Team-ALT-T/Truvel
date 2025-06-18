package alt_t.truvel.searchCountryAndCity.repository;

import alt_t.truvel.searchCountryAndCity.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CountryRepository extends JpaRepository<Country, Long> {

    // 한글 이름으로 검색 (대소문자 구분 없이 포함 여부)
    List<Country> findByKoreanContainingIgnoreCase(String keyword);

    // 영어 이름으로 검색 (대소문자 구분 없이 포함 여부)
    List<Country> findByEnglishContainingIgnoreCase(String keyword);

}
