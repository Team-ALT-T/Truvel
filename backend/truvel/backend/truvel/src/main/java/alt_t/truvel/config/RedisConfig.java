package alt_t.truvel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String host;

    @Value("${spring.data.redis.port}")
    private int port;

    // (선택사항) Redis 비밀번호가 있다면 추가
    // @Value("${spring.data.redis.password:}") // default value for no password
    // private String password;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        // 비밀번호가 있다면 LettuceClientConfiguration에 password 추가
        // LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
        //         .password(password)
        //         .build();
        // return new LettuceConnectionFactory(new RedisStandaloneConfiguration(host, port), clientConfig);

        return new LettuceConnectionFactory(host, port);
    }

    @Bean
    public RedisTemplate<String, String> redisTemplate() {
        RedisTemplate<String, String> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory());

        // Key와 Value 직렬화 설정
        // StringRedisSerializer를 사용하면 Key와 Value가 String 형태로 저장됩니다.
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new StringRedisSerializer());

        // (선택사항) Hash 사용하는 경우 Hash Key/Value 직렬화
        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashValueSerializer(new StringRedisSerializer());

        return redisTemplate;
    }
}