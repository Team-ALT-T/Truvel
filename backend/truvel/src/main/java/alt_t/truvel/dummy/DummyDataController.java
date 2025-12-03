package alt_t.truvel.dummy;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController("/dummy")
@Tag(name = "더미데이터 생성기 - 테스트용")
@RequiredArgsConstructor
public class DummyDataController {
    private final DataInitializer dataInitializer;

    @PostMapping("/create")
    public ResponseEntity<String> dummyDataCreate(){
        try {
            dataInitializer.dummyDataCreation();
            return ResponseEntity.ok("더미 데이터 생성 완료");
        }
        catch (Exception e){
            log.error("더미 데이터 생성 실패", e);
            return ResponseEntity.badRequest().body("더미 데이터 생성 실패");
        }
    }
}
