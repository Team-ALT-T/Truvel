package alt_t.truvel.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    @Test
    @DisplayName("CustomException 핸들러 테스트")
    void handleCustomException() {
        // given
        CustomException customException = new CustomException(ErrorCode.VALIDATION_FAILED);

        // when
        ResponseEntity<ErrorResponseEntity> responseEntity = globalExceptionHandler.handleCustomException(customException);

        // then
        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
        assertEquals(ErrorCode.VALIDATION_FAILED.getCode(), responseEntity.getBody().getCode());
        assertEquals(ErrorCode.VALIDATION_FAILED.getMessage(), responseEntity.getBody().getMessage());
    }

    @Test
    @DisplayName("MethodArgumentNotValidException 핸들러 테스트")
    void handleMethodArgumentNotValidException() {
        // given
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("objectName", "fieldName", "defaultMessage");
        when(bindingResult.getFieldErrors()).thenReturn(Collections.singletonList(fieldError));
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException((MethodParameter) null, bindingResult);

        // when
        ResponseEntity<ErrorResponseEntity> responseEntity = globalExceptionHandler.handleMethodArgumentNotValidException(ex);

        // then
        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
        assertEquals(ErrorCode.VALIDATION_FAILED.getCode(), responseEntity.getBody().getCode());
    }

    @Test
    @DisplayName("MissingServletRequestPartException 핸들러 테스트")
    void handleMissingPart() {
        // given
        MissingServletRequestPartException ex = new MissingServletRequestPartException("partName");

        // when
        ResponseEntity<ErrorResponseEntity> responseEntity = globalExceptionHandler.handleMissingPart(ex);

        // then
        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
        assertEquals(ErrorCode.VALIDATION_FAILED.getCode(), responseEntity.getBody().getCode());
    }

    @Test
    @DisplayName("IllegalArgumentException 핸들러 테스트")
    void handleIllegalArgument() {
        // given
        IllegalArgumentException ex = new IllegalArgumentException("Illegal argument");

        // when
        ResponseEntity<String> responseEntity = globalExceptionHandler.handleIllegalArgument(ex);

        // then
        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
        assertEquals("Illegal argument", responseEntity.getBody());
    }

    @Test
    @DisplayName("RuntimeException 핸들러 테스트")
    void handleRuntimeException() {
        // given
        RuntimeException ex = new RuntimeException("Runtime error");

        // when
        ResponseEntity<String> responseEntity = globalExceptionHandler.handleIllegalArgument(ex);

        // then
        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
        assertEquals("Runtime error", responseEntity.getBody());
    }

    @Test
    @DisplayName("RouteOptException 핸들러 테스트")
    void handleRouteOptException() {
        // given
        RouteOptException ex = new RouteOptException("Route optimization error");

        // when
        ResponseEntity<String> responseEntity = globalExceptionHandler.handleRouteOptException(ex);

        // then
        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
        assertEquals("Route optimization error", responseEntity.getBody());
    }
}