package alt_t.truvel.auth.emailVerification.service;

import alt_t.truvel.auth.emailVerification.domain.entity.EmailVerification;
import alt_t.truvel.auth.emailVerification.domain.repository.EmailVerificationRepository;
import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.auth.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationRepository verificationRepository;
    private final EmailSenderService emailSenderService;
    private final UserRepository userRepository;

    private static final int CODE_EXPIRATION = 10;


    /**
     * 이메일 인증 코드 발송
     * @param email : 사용자가 입력한 이메일 주소
     */
    public void sendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

        // 최근 인증 요청 조회
        Optional<EmailVerification> latestRequest = verificationRepository
                .findTopByEmailOrderByExpiresAtDesc(email);

        if (latestRequest.isPresent() && !latestRequest.get().isUsed()
                && latestRequest.get().getExpiresAt().isAfter(LocalDateTime.now())) {
            // 아직 유효한 코드 존재 → 재전송
            emailSenderService.sendEmail(
                    email,
                    "Truvel 이메일 인증 코드입니다.",
                    "인증 코드: " + latestRequest.get().getCode() + "\n10분 내로 입력해주세요."
            );
            return;
        }

        // 새 코드 생성
        String code = generateCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(CODE_EXPIRATION);

        EmailVerification verification = EmailVerification.builder()
                .email(email)
                .code(code)
                .expiresAt(expiresAt)
                .used(false)
                .user(user)
                .build();

        verificationRepository.save(verification);

        emailSenderService.sendEmail(
                email,
                "Truvel 이메일 인증 코드",
                "인증 코드: " + code + "\n10분 내로 입력해주세요."
        );
    }

    /**
     * 인증 코드 확인
     * @param email : 사용자가 입력한 이메일
     * @param code : 사용자가 입력한 인증 코드
     */
    public void verifyCode(String email, String code) {
        EmailVerification verification = verificationRepository
                .findByEmailAndCodeAndUsedFalse(email, code)
                .orElseThrow(() -> new IllegalArgumentException("잘못된 인증 코드입니다."));

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("인증 코드가 만료되었습니다.");
        }

        verification.setUsed(true);
        verificationRepository.save(verification);

        User user = verification.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    /**
     * 이메일 인증 코드 생성
     * @return : 생성된 인증 코드
     */
    private String generateCode() {
        int code = (int)(Math.random() * 900000) + 100000;
        return String.valueOf(code); // 6자리 숫자
    }
}
