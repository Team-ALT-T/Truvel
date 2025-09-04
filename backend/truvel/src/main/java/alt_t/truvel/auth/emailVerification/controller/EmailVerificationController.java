package alt_t.truvel.auth.emailVerification.controller;

import alt_t.truvel.auth.emailVerification.dto.EmailVerificationConfirmRequest;
import alt_t.truvel.auth.emailVerification.dto.EmailVerificationRequest;
import alt_t.truvel.auth.emailVerification.dto.EmailVerificationResponse;
import alt_t.truvel.auth.emailVerification.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    @PostMapping("/emails/send")
    public ResponseEntity<EmailVerificationResponse<Void>> sendVerificationCode(
            @RequestBody EmailVerificationRequest request) {
        try {
            emailVerificationService.sendVerificationCode(request.getEmail());
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body(EmailVerificationResponse.fail("인증 코드 전송에 실패했습니다: " + e.getMessage()));
        }

        return ResponseEntity.ok(EmailVerificationResponse.success("인증 코드가 전송되었습니다."));
    }

    @PostMapping("/emails/verify")
    public ResponseEntity<EmailVerificationResponse<Void>> verifyCode(
            @RequestBody EmailVerificationConfirmRequest request) {
        emailVerificationService.verifyCode(request.getEmail(), request.getCode());
        return ResponseEntity.ok(EmailVerificationResponse.success("이메일 인증이 완료되었습니다."));
    }
}