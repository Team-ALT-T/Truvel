package alt_t.truvel.auth.emailVerification.controller;

import alt_t.truvel.auth.emailVerification.dto.EmailVerificationConfirmRequest;
import alt_t.truvel.auth.emailVerification.dto.EmailVerificationRequest;
import alt_t.truvel.auth.emailVerification.dto.EmailVerificationResponse;
import alt_t.truvel.auth.emailVerification.service.EmailVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "이메일 인증 API", description = "이메일 인증 관련 API")
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    @PostMapping("/emails/send")
    @Operation(summary = "이메일 인증 코드 전송", description = "사용자 이메일로 인증 코드를 전송합니다.")
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

    @Operation(summary = "이메일 인증 코드 확인", description = "사용자가 입력한 인증 코드를 확인합니다.")
    @PostMapping("/emails/verify")
    public ResponseEntity<EmailVerificationResponse<Void>> verifyCode(
            @RequestBody EmailVerificationConfirmRequest request) {
        emailVerificationService.verifyCode(request.getEmail(), request.getCode());
        return ResponseEntity.ok(EmailVerificationResponse.success("이메일 인증이 완료되었습니다."));
    }
}