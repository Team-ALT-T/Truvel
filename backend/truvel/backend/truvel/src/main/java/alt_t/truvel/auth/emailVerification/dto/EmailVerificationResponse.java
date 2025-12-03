package alt_t.truvel.auth.emailVerification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmailVerificationResponse<T> {

    private String status;
    private String message;
//    private T data;

    public static <T> EmailVerificationResponse<T> success(String message) {
        return new EmailVerificationResponse<>("SUCCESS", message);
    }

    public static <T> EmailVerificationResponse<T> fail(String message) {
        return new EmailVerificationResponse<>("FAILURE", message);
    }
}
