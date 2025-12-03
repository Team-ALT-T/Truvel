package alt_t.truvel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
// 데이터 감사 기능 활성화
@EnableJpaAuditing
@SpringBootApplication
public class TruvelApplication {
	public static void main(String[] args) {
		SpringApplication.run(TruvelApplication.class, args);
	}

}
