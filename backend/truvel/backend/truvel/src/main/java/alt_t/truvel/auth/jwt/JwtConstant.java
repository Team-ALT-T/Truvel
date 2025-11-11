package alt_t.truvel.auth.jwt;

public class JwtConstant {

    public static final String GRANT_TYPE = "Bearer"; // 인증방식
    public static final String AUTHORIZATION_HEADER = "Authorization"; // HTTP 요청 헤더에 인증 정보를 담는 키
    public static final String TOKEN_PREFIX = "Bearer "; // 토큰 앞에 붙는 단어
    public static final long ACCESS_TOKEN_EXPIRE_TIME = 1000 * 60 * 30; // 30분
    public static final long REFRESH_TOKEN_EXPIRE_TIME = 1000 * 60 * 60 * 24 * 7; // 7일

}
