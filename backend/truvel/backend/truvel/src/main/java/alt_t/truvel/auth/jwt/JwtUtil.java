package alt_t.truvel.auth.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

import static alt_t.truvel.auth.jwt.JwtConstant.*;

/**
 * 비교적 저수준의 JWT 작업만 담당
 * 1. JWT 키 관리
 * 2. 토큰 파싱, 유효성 검증
 */
@Component
@Slf4j
public class JwtUtil {

    private final RedisTemplate<String, String> redisTemplate;

    private final Key key; // key를 Util에서 관리!


    // JWT 생성자
    public JwtUtil(@Value("${jwt.secret}") String secretKey, RedisTemplate<String, String> redisTemplate) {
        // jwt 시크릿 키가 있는지 판단
        if (secretKey == null || secretKey.isEmpty()) {
            throw new IllegalArgumentException("JWT 시크릿 키가 없습니다.");
        }

        // 토큰 발급 로직
        try {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey); // 시크릿 키로 디코딩
            log.info("DEBUG: 시크릿 키가 성공적으로 bytes 형태로 변환되었습니다. Length: {}", keyBytes.length);

            // JWT 라이브러리 (HS256)는 최소 32바이트의 키를 요구함
            if (keyBytes.length < 32) {
                log.error("DEBUG: 디코딩된 키의 길이 = ({}), 최소 32바이트 이상이여야 합니다.", keyBytes.length);
                throw new IllegalArgumentException("JWT 시크릿 키 길이가 너무 짧습니다.. Base64형식으로 디코된 후 32바이트 이상이여야 합니다.");
            }

            this.key = Keys.hmacShaKeyFor(keyBytes);
            log.info("DEBUG: JwtUtil이 유효한 키와 함께 초기화되었습니다.");
        } catch (RuntimeException e) {
            log.error("DEBUG: 시크릿 키로 디코딩을 실패했거나, 키가 유효하지 않습니다. Error: {}", e.getMessage(), e);
            // 이 예외는 보통 Base64 문자열 형식이 잘못되었거나 디코딩 후 길이가 부족할 때 발생합니다.
            throw new RuntimeException("DEBUG : Base64 문자열 형식이 잘못되었거나, 길이가 부족합니다. 설정 파일을 확인해주세요.", e);
        } catch (Exception e) {
            log.error("DEBUG: Jwt 초기화 중 예외가 발생했습니다.: {}", e.getMessage(), e);
            throw new RuntimeException("JWT 초기화중 예외가 발생했습니다.", e);
        }

        // redis 추가
        this.redisTemplate = redisTemplate; // RedisTemplate 초기화
    }


    /**
     * 사용자 정보를 가지고 AccessToken, RefreshToken을 생성하는 메서드
     */
    public JwtToken generateToken(Long userId, String email) {
        long now = (new Date()).getTime(); // 발급 당시 시간

        String authorities = "ROLE_USER"; // 권한, 사용자 기본 권한을 가짐

        // accessToken 생성 -> JWT 구성
        String accessToken = Jwts.builder()
                // 헤더는 JWT가 자동으로 할당, 토큰 타입(typ), 시그니쳐 알고리즘(alg)가 할당됨

                // 페이로드에 표시될 값들은 직접 구성
                .setSubject(email) // subscriber, 사용자 아이디
                .claim("auth", authorities) // 사용자 권한
                .claim("id", String.valueOf(userId)) // 사용자 아이디 -> 리팩토링 대상
                .claim("email", email)
                .setExpiration(new Date(now + ACCESS_TOKEN_EXPIRE_TIME)) // 토큰 만료 시간
                .signWith(key, SignatureAlgorithm.HS256) // 키 암호화에 사용된 알고리즘, HS256 사용 -> 서명 생성

                .compact(); // 헤더, 페이로드(클레임), 시그니쳐를 합쳐서 최종 JWT를 생성


        // Refresh Token 생성
        String refreshToken = Jwts.builder()
                .setExpiration(new Date(now + REFRESH_TOKEN_EXPIRE_TIME)) // 만료 시간 설정
                .signWith(key, SignatureAlgorithm.HS256) // 사용된 암호화
                .compact();

        // 생성된 권한, 액세스 토큰, 리프레시 토큰 반환
        return JwtToken.builder()
                .grantType(GRANT_TYPE)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }


    //     토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            // JWT 자체 유효성 검증
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;

            // 예외를 잡으면, 메시지 반환
        } catch (SecurityException | MalformedJwtException e) {
            log.info("유효하지 않은 토큰입니다.", e);
        } catch (ExpiredJwtException e) {
            log.info("만료된 토큰입니다.", e);
        } catch (UnsupportedJwtException e) {
            log.info("지원하지 않는 토큰입니다.", e);
        } catch (IllegalArgumentException e) {
            log.info("JWT claims가 비어있습니다.", e);
        }
        return false; // 이후 false -> 유효하지 않은 토큰으로 판단
    }


    /**
     * JWT로 발급받은 엑세스 토큰에서 페이로드(Claims) 추출
     * JwtProvider에서 이 메서드를 호출하여 Claims를 추출합니다.
     *
     * @param accessToken : 요청한 사용자의 엑세스 토큰
     * @return : 토큰에서 페이로드를 추출해 반환
     */
    public Claims parseClaims(String accessToken) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key) // 여기서 this.key 사용
                    .build()
                    .parseClaimsJws(accessToken)
                    .getBody();
        } catch (ExpiredJwtException e) {
            // 만료된 경우에도 Claims는 가져올 수 있도록 처리합니다.
            return e.getClaims();
        } catch (io.jsonwebtoken.security.SignatureException e) {
            log.warn("유효하지 않은 JWT 서명입니다: {}", e.getMessage());
            throw new JwtException("유효하지 않은 JWT 서명입니다", e); // 적절한 커스텀 예외로 래핑
        } catch (MalformedJwtException e) {
            log.warn("잘못 구성된 JWT 토큰입니다: {}", e.getMessage());
            throw new JwtException("잘못 구성된 JWT 토큰입니다:", e);
        } catch (UnsupportedJwtException e) {
            log.warn("지원되지 않는 JWT 토큰입니다: {}", e.getMessage());
            throw new JwtException("지원되지 않는 JWT 토큰입니다", e);
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims 문자열이 비어있습니다: {}", e.getMessage());
            throw new JwtException("JWT claims 문자열이 비어있습니다", e);
        }
    }


    /**
     * 토큰에서 사용자 id를 추출
     *
     * @param token : 요청한 사용자의 토큰
     * @return : 토큰을 파싱해서 추출한 사용자 아이디
     */
    public Long getUserIdFromToken(String token) {
        return Long.parseLong(Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject());
    }


    /**
     * 토큰의 유효시간을 연산하는 메서드
     *
     * @param token : 토큰
     * @return : (만료 시간 - 현재 시간)의 값
     */
    public long getExpiration(String token) {
        Date expiration = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
        long now = System.currentTimeMillis();

        return expiration.getTime() - now;
    }
}
