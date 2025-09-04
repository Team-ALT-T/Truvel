package alt_t.truvel.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class RouteOptException extends RuntimeException {
    public RouteOptException(String message) {
        super(message);
    }
}
