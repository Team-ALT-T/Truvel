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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private JwtProvider jwtProvider;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private JwtAuthService jwtAuthService;

    private SignUpRequest signUpRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        signUpRequest = new SignUpRequest("test@test.com", "testNickname", "password", true, true, true, true);


        loginRequest = new LoginRequest("test@test.com", "password");

        user = User.builder()
                .email("test@test.com")
                .nickname("testNickname")
                .password("password")
                .emailVerified(true)
                .build();
        user.setEmailVerified(true);
    }

    @Test
    @DisplayName("회원가입 성공 테스트")
    void signup_Success() {
        // given
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(userRepository.findByNickname(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        // when
        SignUpResponse response = jwtAuthService.signup(signUpRequest);

        // then
        assertNotNull(response);
        assertEquals("회원가입되었습니다.", response.getMessage());
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 중복")
    void signup_Fail_EmailExists() {
        // given
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));

        // when & then
        assertThrows(RuntimeException.class, () -> {
            jwtAuthService.signup(signUpRequest);
        });
    }

    @Test
    @DisplayName("회원가입 실패 - 닉네임 중복")
    void signup_Fail_NicknameExists() {
        // given
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(userRepository.findByNickname(any())).thenReturn(Optional.of(user));

        // when & then
        assertThrows(RuntimeException.class, () -> {
            jwtAuthService.signup(signUpRequest);
        });
    }

    @Test
    @DisplayName("로그인 성공 테스트")
    void login_Success() {
        // given
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtUtil.generateToken(any(), any())).thenReturn(JwtToken.builder()
                .accessToken("accessToken")
                .refreshToken("refreshToken")
                .grantType("bearer")
                .build());

        // when
        LoginResponse response = jwtAuthService.login(loginRequest);

        // then
        assertNotNull(response);
        assertEquals("로그인에 성공하였습니다.", response.getMessage());
        assertEquals("accessToken", response.getAccessToken());
    }

    @Test
    @DisplayName("로그인 실패 - 존재하지 않는 이메일")
    void login_Fail_UserNotFound() {
        // given
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        // when & then
        assertThrows(RuntimeException.class, () -> {
            jwtAuthService.login(loginRequest);
        });
    }



    @Test
    @DisplayName("로그인 실패 - 비밀번호 불일치")
    void login_Fail_PasswordMismatch() {
        // given
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        // when & then
        assertThrows(BadCredentialsException.class, () -> {
            jwtAuthService.login(loginRequest);
        });
    }

    @Test
    @DisplayName("로그인 실패 - 이메일 미인증")
    void login_Fail_EmailNotVerified() {
        // given
        user.setEmailVerified(false);
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);

        // when & then
        assertThrows(RuntimeException.class, () -> {
            jwtAuthService.login(loginRequest);
        });
    }

    @Test
    @DisplayName("로그아웃 성공 테스트")
    void logout_Success() {
        // given
        String token = "validToken";
        when(jwtProvider.validateToken(token)).thenReturn(true);
        when(jwtUtil.getExpiration(token)).thenReturn(1000L);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        // when
        jwtAuthService.logout(token);

        // then
        verify(redisTemplate.opsForValue(), times(1)).set(token, "logout", 1000L, TimeUnit.MILLISECONDS);
    }
}