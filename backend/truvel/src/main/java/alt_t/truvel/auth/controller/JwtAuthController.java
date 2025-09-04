package alt_t.truvel.auth.controller;

import alt_t.truvel.auth.dto.LoginRequest;
import alt_t.truvel.auth.dto.LoginResponse;
import alt_t.truvel.auth.dto.SignUpRequest;
import alt_t.truvel.auth.dto.SignUpResponse;
import alt_t.truvel.auth.jwt.JwtProvider;
import alt_t.truvel.auth.jwt.JwtUtil;
import alt_t.truvel.auth.service.JwtAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

// Swagger 의존성 추가시 @Tag, @Operation 코드에서 주석 해제
//@Tag(name = "인증 기능 API", description = "회원가입, 로그인, 로그아웃 관련 API")
@RestController
@RequiredArgsConstructor
public class JwtAuthController {

    private final JwtAuthService jwtAuthService;
    private final JwtUtil jwtUtil;
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;


    /**
     * 회원가입
     * @param request : 회원가입 요청
     * @return : 성공 확인
     */
//    @Operation(summary = "회원가입", description = "회원가입을 할 수 있습니다.")
    @PostMapping("/auth/signup")
    private ResponseEntity<SignUpResponse> signup(@RequestBody @Valid SignUpRequest request) {

        SignUpResponse response = jwtAuthService.signup(request);

        return ResponseEntity.ok(response);
    }


    /**
     * 로그인 메서드
     * @param request
     * @return
     */
//    @Operation(summary = "로그인", description = "로그인시 토큰을 받습니다.")
    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        LoginResponse response = jwtAuthService.login(request);
        return ResponseEntity.ok(response);
    }


    /**
     * 로그아웃 메서드
     * @param request
     * @return
     */
//    @Operation(summary = "로그아웃", description = "로그아웃을 할 시 토큰이 반납됩니다.")
    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // 헤더에서 토큰을 꺼냄
        String token = jwtProvider.resolveToken(request);
        if (token == null) { // 토큰이 없으면 400 상태 코드 반환
            return ResponseEntity.badRequest().body("토큰이 없습니다.");
        }
        if (redisTemplate.hasKey(token)) {  // redis에 토큰이 있으면 사용불가
            // Redis 서버에 key가 존재하는지 boolean형으로 판단
            throw new SecurityException("이미 로그아웃된 토큰입니다.");
        }
        jwtAuthService.logout(token);
        return ResponseEntity.ok("로그아웃 되었습니다.");
    }


    /**
     * 인증된 사용자가 보호된 리소스에 접근한다.
     * API 테스트시 사용자가 인증된 사용자인지 확인하는 용도
     * 로그아웃 테스트에만 사용됨
     * @return : 성공 메시지
     */
    @GetMapping("/protected-resource")
    public ResponseEntity<String> getProtectedResource() {
        // 이 코드가 실행된다는 것 자체가 인증에 성공했다는 의미
        return ResponseEntity.ok("성공적으로 보호된 리소스에 접근했습니다.");
    }


}
