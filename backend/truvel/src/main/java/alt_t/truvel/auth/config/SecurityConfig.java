package alt_t.truvel.auth.config;

import alt_t.truvel.auth.JwtAuthenticationFilter;
import alt_t.truvel.auth.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

//    @Bean
//    public JwtAuthenticationFilter jwtAuthenticationFilter() {
//        return new JwtAuthenticationFilter(jwtProvider, redisTemplate); // 여기에 redisTemplate 넘김
//    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // REST API이므로 basic auth 및 csrf 보안을 사용하지 않음
                .httpBasic(httpBasic -> httpBasic.disable())
                .csrf(csrf -> csrf.disable())
                .formLogin(formLogin -> formLogin.disable()) // 폼 로그인은 사용하지 않음.
                // JWT를 사용하기 때문에 세션을 사용하지 않음
                .sessionManagement(sessionManagement -> sessionManagement
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorizeHttpRequests ->
                                authorizeHttpRequests
                                        // 1. 정적 리소스 (JS, CSS, 이미지 등) 및 webjars (스웨거 UI 리소스 포함) 접근 허용
                                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                                        // 2. 인증/회원가입 등 인증 없이 허용할 API 경로
                                        .requestMatchers("/auth/**").permitAll() // '/auth/'로 시작하는 요청 모두 접근 허가 (기존에 '/api/auth/**'였다면 맞춰주세요)
                                        // 3. OpenApi(Swagger) 문서 경로 명시적 허용 (PathRequest에 포함되지 않는 경우 대비)
                                        .requestMatchers("/v3/api-docs/**").permitAll()
                                        // 4. Swagger UI 관련 경로 명시적 허용
                                        .requestMatchers("/swagger-ui/**").permitAll()
                                        // 5. 이메일 인증 기능은 허용
                                        .requestMatchers("/emails/**").permitAll()
                                        .requestMatchers("/error").permitAll()
//                                .requestMatchers("/swagger-ui.html").permitAll() // swagger-ui.html 직접 접근 시
                                        // 5. 조회 API는 비로그인 유저도 접근 가능 (예시)
//                                .requestMatchers(HttpMethod.GET, "/api/post/**").permitAll()
//                                .requestMatchers(HttpMethod.GET, "/api/posts").permitAll()
                                        // 6. 모니터링 도구 관련 경로는 패스 가능
//                                        .requestMatchers("/actuator/**").permitAll()
//                                        .requestMatchers( "/prometheus/**").permitAll()
//                                        .requestMatchers("/grafana/**").permitAll()
//                                        .requestMatchers("/api/metrics/**").permitAll()
//                                        .requestMatchers("metrics").permitAll()


                                        .anyRequest().authenticated() // 그 외 모든 요청 인증 처리
                )
                // JWT 인증을 위한 필터 추가 (UsernamePasswordAuthenticationFilter 이전에 실행)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }




}