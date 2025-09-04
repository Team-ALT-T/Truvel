package alt_t.truvel.auth.emailVerification.domain.repository;

import alt_t.truvel.auth.emailVerification.domain.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    /**
     * 사용자가 입력한 이메일로 최근 인증 요청으로 만들어진 인증 코드 1개 조회
     * @param email : 사용자가 입력한 이메일
     * @return : 가장 최근 발송한 인증 코드 1개
     */
    Optional<EmailVerification> findTopByEmailOrderByExpiresAtDesc(String email);

    /**
     * 입력된 이메일에 전송된 인증 코드가 존재하고, 사용되지 않았는지 검증
     * @param email : 사용자가 입력한 이메일
     * @param code : 이전에 발급한 이메일 인증 코드
     * @return : used 컬럼을 true, User.emailVerified 컬럼을 true로 처리함
     */
    Optional<EmailVerification> findByEmailAndCodeAndUsedFalse(String email, String code);

}
