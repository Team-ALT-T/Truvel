package alt_t.truvel.searchCountryAndCity.domain.repository;

import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CountryRepository extends JpaRepository<Country, Long> {

    // 한글 이름으로 검색 (대소문자 구분 없이 포함 여부)
    List<Country> findByKoreanContainingIgnoreCase(String keyword);
    List<Country> findByKoreanContainingIgnoreCase(String keyword, Pageable pageable);

    // 영어 이름으로 검색 (대소문자 구분 없이 포함 여부)
    List<Country> findByEnglishContainingIgnoreCase(String keyword);
    List<Country> findByEnglishContainingIgnoreCase(String keyword, Pageable pageable);

    List<Country> findTop100ByOrderByPopularityDesc();
}
