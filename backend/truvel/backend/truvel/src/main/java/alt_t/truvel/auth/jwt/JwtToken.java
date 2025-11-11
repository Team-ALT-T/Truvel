package alt_t.truvel.auth.jwt;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JwtToken {
    private String grantType; // 권한타입
    private String accessToken; // 접근토큰
    private String refreshToken; // 리프레시 토큰
}