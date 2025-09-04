package alt_t.truvel.auth.emailVerification.domain.entity;


import alt_t.truvel.auth.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;           // 사용자가 입력한 이메일
    private String code;            // 인증 코드 (예: 6자리 숫자)

    private LocalDateTime expiresAt;  // 만료 시각 - 기본 10분
    private boolean used = false;     // 재사용 방지

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;                // 인증 요청을 보낸 사용자

    public void setUser(User user) {
        this.user = user;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }
}