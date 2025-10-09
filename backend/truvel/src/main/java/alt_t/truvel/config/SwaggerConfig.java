package alt_t.truvel.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        SecurityRequirement securityRequirement = new SecurityRequirement();
        securityRequirement.addList("bearerAuth");

        Components components = new Components();
        components.addSecuritySchemes("bearerAuth",
                new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"));

        return new OpenAPI()
                .info(new Info()
                        .title("Truvel API")
                        .version("1.0")
                        .description("""
                                Truvel 프로젝트의 Swagger 문서입니다.\s
                                모든 API는 JWT 토큰을 필요로 합니다.\s
                                토큰은 'Bearer {token}' 형식으로 Authorization 헤더에 포함되어야 합니다."""))
                .addSecurityItem(securityRequirement)
                .components(components);
    }
}
