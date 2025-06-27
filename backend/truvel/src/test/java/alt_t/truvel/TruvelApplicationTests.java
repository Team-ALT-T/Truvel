package alt_t.truvel;

import alt_t.truvel.config.RestTemplateConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@Import(RestTemplateConfig.class)
@ActiveProfiles("test")
class TruvelApplicationTests {

	@Test
	void contextLoads() {
	}

}
