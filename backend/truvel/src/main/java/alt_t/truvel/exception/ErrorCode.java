package alt_t.truvel.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import static org.springframework.http.HttpStatus.*;

import static org.springframework.http.HttpStatus.*;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // VALIDATION
    VALIDATION_FAILED(BAD_REQUEST, 2001, "[Validation] Request에서 요청한 값이 올바르지 않습니다."),

    // Location
    PLACE_NOT_FOUND(HttpStatus.NOT_FOUND, 3001, "[Location] 검색 결과가 없습니다."),
    GOOGLE_API_ERROR(HttpStatus.BAD_GATEWAY, 3002, "[Location] 외부 API 호출 중 오류가 발생했습니다.");

    //dayschecdul



    private final HttpStatus httpStatus;
    private final Integer code;
    private final String message;
}