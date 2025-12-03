package alt_t.truvel.auth.service;

import alt_t.truvel.auth.dto.LoginRequest;
import alt_t.truvel.auth.dto.LoginResponse;
import alt_t.truvel.auth.dto.SignUpRequest;
import alt_t.truvel.auth.dto.SignUpResponse;
import alt_t.truvel.auth.jwt.JwtProvider;
import alt_t.truvel.auth.jwt.JwtToken;
import alt_t.truvel.auth.jwt.JwtUtil;
import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.auth.user.domain.repository.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtAuthService {

    private final RedisTemplate<String, String> redisTemplate; // spring data redis
    private final JwtUtil jwtUtil;
    private final JwtProvider jwtProvider;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    /**
     * 회원가입
     * @param request : 회원가입 요청 DTO, 사용자 정보가 들어감
     * @return : 회원가입 성공 메시지와 저장된 유저의 아이디
     */
    @Transactional
    public SignUpResponse signup(SignUpRequest request) {

        // 유효한 이메일 형식인지 확인
        try {
            InternetAddress emailAddr = new InternetAddress(request.getEmail());
            emailAddr.validate();
        } catch (AddressException ex) {
            throw new IllegalArgumentException("유효하지 않은 이메일 형식입니다: " + request.getEmail());
        }

        // 중복 로그인 아이디 확인
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.: " + request.getEmail());
        }
        // 중복 닉네임 확인
        else if (userRepository.findByNickname(request.getNickname()).isPresent()) {
            throw new RuntimeException("이미 사용 중인 닉네임입니다.: " + request.getNickname());
        }


        // 사용자를 DB에 저장
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = request.toUser(encodedPassword);

        // DB에 저장된 사용자
        User savedUser =  userRepository.save(user);

        return SignUpResponse.of("회원가입되었습니다.", savedUser.getId());
    }


    /**
     * 로그인
     * @param request : 로그인 요청 DTO, 이메일과 패스워드 필요
     * @return : 로그인 응답 DTO
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        try {
            // 존재하는 유저인지 판단
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> {
                        log.warn("존재하지 않는 이메일로 로그인 시도: {}", request.getEmail());
                        return new RuntimeException("존재하지 않는 아이디입니다.");
                    });

            // 비밀번호가 맞는지 검증
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.warn("비밀번호 불일치. 입력된 이메일: {}", request.getEmail());
                throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
            }

            // 이메일 인증이 완료된 사용자인지 확인
            if (user.getEmailVerified()){
                log.info("이메일 인증 완료 사용자 로그인: {}", request.getEmail());
            } else {
                log.warn("이메일 인증되지 않은 사용자 로그인 시도: {}", request.getEmail());
                throw new RuntimeException("이메일 인증이 완료되지 않은 사용자입니다.");
            }

            // 사용자 아이디로 JWT 액세스/리프레시 토큰 생성
            JwtToken token = jwtUtil.generateToken(user.getId(), user.getEmail());
            log.info("로그인 성공: {}", request.getEmail());

            return LoginResponse.from("로그인에 성공하였습니다.",
                    token.getAccessToken(),
                    token.getRefreshToken(),
                    token.getGrantType());

        } catch (Exception e) {
            log.error("로그인 중 오류 발생", e);
            throw e;
        }
    }


    /**
     * 로그아웃 메서드
     * @param token : 반납할 토큰
     */
    public void logout(String token) {
        if (jwtProvider.validateToken(token)) { // 유효한 토큰일때
            long expiration = jwtUtil.getExpiration(token); //유효기간을 연산해서 할당
            // JWT 자체는 무상태라서 서버에 토큰 정보가 담기지 않는다.
            // 따라서 강제로 토큰을 만료하는게 불가능하기에 따로 관리해야하는데..
            // 이때 Redis에 토큰 정보를 담아둔다!

            // Redis에 로그아웃되어 만료돤 토큰을 넣어두고, 사용불가한 토큰을 관리할 수 있다.
            // 3. Redis에 토큰 저장 (블랙리스트 추가)
            try {
                redisTemplate.opsForValue().set(token, "logout", expiration, TimeUnit.MILLISECONDS);
                log.info("Access Token이 Redis 블랙리스트에 성공적으로 추가되었습니다. 토큰: {} 남은 유효기간: {}ms", token, expiration);
            } catch (Exception e) {
                // Redis 연결 오류, Redis 서버 문제 등
                log.error("Redis에 토큰 저장 중 오류 발생. 토큰: {}, 오류: {}", token, e.getMessage(), e);
                // Redis 오류는 500 Internal Server Error로 이어질 수 있으므로,
                // 적절한 사용자 정의 예외로 래핑하여 컨트롤러로 전달
                throw new RuntimeException("로그아웃 처리 중 데이터베이스 오류가 발생했습니다.", e);
            }
            // token(eyJ...) : "logout" 형태로 저장
        }
    }

}
