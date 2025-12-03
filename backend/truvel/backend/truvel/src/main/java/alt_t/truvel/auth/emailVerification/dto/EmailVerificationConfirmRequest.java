package alt_t.truvel.auth.emailVerification.dto;

import lombok.Getter;

@Getter
public class EmailVerificationConfirmRequest {
    private String email;
    private String code;
}