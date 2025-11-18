package alt_t.truvel.auth.jwt;

import alt_t.truvel.auth.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Collection;

/**
 * 비교적 고수준의 jwt 작업 정의
 * 1. 토큰 유효성 판단
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class JwtProvider {

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;

//    @Autowired
//    public JwtProvider(JwtUtil jwtUtil, RedisTemplate<String, String> redisTemplate) {
//        System.out.println("🔥 JwtProvider 생성자 실행됨");
//        this.jwtUtil = jwtUtil;
//        this.redisTemplate = redisTemplate;
//        log.info("✅ JwtProvider 생성자 호출됨");
//    }
//
////     ================== 디버깅 코드 추가 시작 ==================
//    @PostConstruct
//    public void checkDependencies() {
//        if (jwtUtil == null) {
//            log.error("!!!!!! FATAL: JwtProvider 생성 후 jwtUtil이 null입니다. !!!!!!");
//        } else {
//            log.info("--- SUCCESS: JwtProvider 생성 및 의존성 주입 성공. jwtUtil의 클래스: {}", jwtUtil.getClass().getName());
//        }
//    }
//     ================== 디버깅 코드 추가 끝 ====================


    @PostConstruct
    public void debugRedisConnection() {
        try {
            log.info("🔍 Redis 연결 테스트 시작...");
            String result = redisTemplate.getConnectionFactory().getConnection().ping();
            log.info("✅ Redis 연결 성공: {}", result);  // 기대값: PONG
        } catch (Exception e) {
            log.error("❌ Redis 연결 실패: {}", e.getMessage(), e);
        }
    }


    // Jwt 토큰을 복호화하여 토큰에 들어있는 정보를 꺼내는 메서드
    public Authentication getAuthentication(String accessToken) {
        // 페이로드를 파싱하여 할당
        Claims claims = parseClaims(accessToken);

        if (claims.get("auth") == null || claims.get("id") == null) {
            throw new RuntimeException("토큰에 auth, id 정보가 없습니다.");
        }

        // 권한 정보 가져오기
        Collection<? extends GrantedAuthority> authorities = Arrays.stream(claims.get("auth").toString().split(","))
                .map(SimpleGrantedAuthority::new)
                .toList();


        // UserPrincipal 생성 (password는 빈 문자열)
        Long id = Long.parseLong(claims.get("id").toString());
        String username = claims.getSubject();  // 일반적으로 이메일 또는 유저네임
        String email = claims.get("email", String.class);

        // 인증된 사용자를 담는 객체 생성
        // UserPrincipal 생성 (password는 빈 문자열 처리)
        UserPrincipal principal = UserPrincipal.builder()
                .id(id)
                .email(email)
                .username(username)
                .password("") // 비밀번호는 인증 처리 시점에서만 사용되므로 "" 처리
                .authorities(authorities)
                .build();

        // "id"를 String으로 꺼내서 Long 변환
        String idStr = claims.get("id", String.class);
        Long userId = idStr != null ? Long.valueOf(idStr) : null;


        return new UsernamePasswordAuthenticationToken(principal, "", authorities);
    }


    /**
     * 토큰 유효성 검증 메서드
     * @param token : 사용자의 토큰
     * @return : 유효한 토큰일때 true 반환
     */
    public boolean validateToken(String token) {
        try {
            // 1. Redis 블랙리스트에서 토큰이 있는지 확인 (로그아웃된 토큰인지)
            if (redisTemplate.opsForValue().get(token) != null) {
                log.info("블랙리스트에 있는 토큰입니다: {}", token);
                return false; // 블랙리스트에 있으면 유효하지 않음
            }

            // 2. JWT 자체 유효성 검증
            return jwtUtil.validateToken(token);

            // 예외를 잡으면, 메시지 반환
        } catch (Exception e) { // 혹시 모를 예외 처리
            log.error("토큰 유효성 검증 중 예외 발생: {}", e.getMessage());
            return false;
        }
    }


    /**
     * 사용자 요청에서 토큰을 꺼내는 메서드
     * @param request : 사용자가 보낸 임의의 요청
     * @return : if문이 참일때 꺼내온 토큰을 반환, 아니면 null 반환
     */
    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(JwtConstant.AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(JwtConstant.TOKEN_PREFIX)) {
            return bearerToken.substring(7); // 7번째(토큰 시작지점)부터 값을 가져옴, Bearer ~~
        }
        return null;
    }


    /**
     * JWT로 발급받은 엑세스 토큰에서 페이로드 추출
     * @param accessToken : 요청한 사용자의 엑세스 토큰
     * @return : 토큰에서 페이로드를 추출해 반환
     */
    private Claims parseClaims(String accessToken) {
        return jwtUtil.parseClaims(accessToken); // 만료된 경우에도 claims는 사용
    }
}