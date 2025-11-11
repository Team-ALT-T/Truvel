package alt_t.truvel.auth;

import alt_t.truvel.auth.jwt.JwtConstant;
import alt_t.truvel.auth.jwt.JwtProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;
import java.util.Arrays;

@Component
//@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends GenericFilterBean {
    private final JwtProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;

    public JwtAuthenticationFilter(JwtProvider jwtTokenProvider, RedisTemplate<String, String> redisTemplate) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.redisTemplate = redisTemplate;
    }


    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    // 허용 경로
    private static final String[] AGREE_PATHS = {
            "/error",
            "/auth/**",
            "/emails/**",
//            "/auth/signup",
//            "/auth/login",
            "/swagger-resources/**",
            "/webjars/**",
            "/v3/api-docs/**",
//            "/v3/api-docs",
            "/swagger-ui/**",
//            "/swagger-ui.html",
//            "/actuator/**",
//            "/prometheus/**",
//            "/grafana/**",
//            "/api/metrics/**",
//            "metrics"
    };

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String requestURI = httpRequest.getRequestURI();

        // 스웨거, 모니터링, 인증 관련 경로는 필터 패스 (인증 검사 안 함)
        if (Arrays.stream(AGREE_PATHS).anyMatch(requestURI::startsWith)) {
            chain.doFilter(request, response);
            return;
        }

        // 1. Request Header에서 JWT 토큰 추출
        String token = resolveToken(httpRequest); // HttpServletRequest로 캐스팅된 변수 사용

        // 2. 토큰이 존재하고 유효한지 검사
        if (token != null) { // ⚠️ 토큰이 null이 아닌 경우에만 유효성 검사 시도
            if (jwtTokenProvider.validateToken(token)) {
                // 블랙리스트 검사 추가
                String isLogout = redisTemplate.opsForValue().get(token);
                if (isLogout != null && isLogout.equals("logout")) {
                    log.warn("블랙리스트에 있는 토큰으로 시도: {}", token); // ⚠️ 로그 추가
                    HttpServletResponse httpResponse = (HttpServletResponse) response;
                    httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized
                    httpResponse.getWriter().write("Logout token detected. Please log in again."); // ⚠️ 응답 메시지 추가
                    return; // 필터 체인 중단
                }

                // 토큰이 유효하고 블랙리스트에 없으면 Authentication 객체를 SecurityContext에 저장
                Authentication authentication = jwtTokenProvider.getAuthentication(token);

                // principal 타입 확인 로그
                Object principal = authentication.getPrincipal();
//                log.info("🔍 principal 객체 확인: {}", principal != null ? principal.getClass().getName() : "null");
//                log.info("🔍 principal 값 확인: {}", principal);


                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("인증을 위한 url: {}", requestURI); // ⚠️ 로그 추가

            } else {
                // 토큰은 존재하지만 유효하지 않은 경우 (만료, 변조 등)
                log.warn("유효하지 않은 토큰: {}", requestURI); // ⚠️ 로그 추가
                // 여기서 굳이 401을 바로 보낼 필요는 없음. Spring Security가 이후 처리 (AuthenticationEntryPoint)
            }
        } else {
            // 토큰이 아예 없는 경우 (인증이 필요하지만 토큰이 없는 요청)
            log.debug("토큰이 없음: {}", requestURI); // ⚠️ 로그 추가
            // 여기서도 굳이 401을 바로 보낼 필요는 없음. Spring Security가 이후 처리 (AuthenticationEntryPoint)
        }

        // 인증 여부와 관계없이 다음 필터 또는 서블릿으로 요청을 넘김
        // SecurityContextHolder에 Authentication이 설정되어 있으면 인증된 것으로 처리되고,
        // 없으면 익명(anonymous)으로 처리되거나 인증 실패로 처리됨.
        chain.doFilter(request, response);
    }

    // Request Header에서 토큰 정보 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(JwtConstant.GRANT_TYPE)) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
