package alt_t.truvel.searchCountryAndCity.controller;

import alt_t.truvel.searchCountryAndCity.dto.CitySearchResponse;
import alt_t.truvel.searchCountryAndCity.dto.CountrySearchResponse;
import alt_t.truvel.searchCountryAndCity.service.PublicCountryAndCityReadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@Tag(name = "공개 국가 및 도시 조회 API", description = "인기도 집계 없이 국가와 도시를 조회합니다.")
public class PublicCountryAndCityController {

    private final PublicCountryAndCityReadService publicCountryAndCityReadService;

    @Operation(
            summary = "공개 국가 조회",
            description = "인증 없이 국가를 최대 100개 조회합니다. keyword는 앞뒤 공백 제거 후 최대 50자이며 Redis 인기도를 변경하지 않습니다.")
    @GetMapping("/countries")
    public ResponseEntity<List<CountrySearchResponse>> getCountries(
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(publicCountryAndCityReadService.getCountries(keyword));
    }

    @Operation(
            summary = "공개 도시 조회",
            description = "인증 없이 도시를 최대 100개 조회합니다. keyword는 앞뒤 공백 제거 후 최대 50자이며 Redis 인기도를 변경하지 않습니다.")
    @GetMapping("/cities")
    public ResponseEntity<List<CitySearchResponse>> getCities(
            @RequestParam(required = false) Long countryId,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(publicCountryAndCityReadService.getCities(countryId, keyword));
    }
}
