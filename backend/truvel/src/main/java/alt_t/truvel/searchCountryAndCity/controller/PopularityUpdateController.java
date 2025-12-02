package alt_t.truvel.searchCountryAndCity.controller;

import alt_t.truvel.searchCountryAndCity.service.PopularityService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("popularityUpdate")
@RequiredArgsConstructor
@Tag(name = "인기도 업데이트 테스트용 컨트롤러")
public class PopularityUpdateController {
    private final PopularityService popularityService;

    @PostMapping("/apply-popularity-to-db-and-reset")
    public ResponseEntity<String> applyPopularityToDbAndReset(){
        popularityService.applyPopularityToDbAndReset();
        return ResponseEntity.ok("인기도 업데이트가 완료되었습니다.");
    }
}
