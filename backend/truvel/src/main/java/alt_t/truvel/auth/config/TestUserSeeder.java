package alt_t.truvel.auth.config;

import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.auth.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@Profile("!prod")
public class TestUserSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${seed.test-user.enabled:true}")
    private boolean enabled;

    @Value("${seed.test-user.email:test@example.com}")
    private String email;

    @Value("${seed.test-user.password:Test1234!}")
    private String password;

    @Value("${seed.test-user.nickname:e2e_tester}")
    private String nickname;

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("[TestUserSeeder] 테스트 유저 시딩 비활성화 상태입니다.");
            return;
        }

        if (userRepository.findByEmail(email).isPresent()) {
            log.info("[TestUserSeeder] 테스트 유저가 이미 존재합니다: {}", email);
            return;
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .nickname(nickname)
                .profileImg(null)
                .locationConsent(true)
                .agreeTerms(true)
                .agreePrivacy(true)
                .agreeThirdParty(true)
                .emailVerified(true)
                .build();

        userRepository.save(user);
        log.info("[TestUserSeeder] 테스트 유저 생성 완료: {} / {}", email, nickname);
    }
}
