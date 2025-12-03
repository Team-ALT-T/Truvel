package alt_t.truvel.auth.dto;

import alt_t.truvel.auth.user.domain.entity.User;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SignUpRequest {

    @NotBlank(message = "이메일을 입력해주세요.")
    private String email;

    @NotBlank(message = "이름을 입력해주세요.")
    private String nickname;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;

    // 동의 항목들 추가
    private boolean agreeTerms; // 서비스 이용 동의
    private boolean agreePrivacy; // 개인정보 수집, 이용 동의
    private boolean agreeThirdParty; // 제 3자 개인정보 제공 동의
    private boolean locationConsent; // 위치기반 정보 수집 동의

    @Builder
    public SignUpRequest(String email, String nickname, String password,
                         boolean agreeTerms, boolean agreePrivacy, boolean agreeThirdParty,
                         boolean locationConsent) {
        this.email = email;
        this.nickname = nickname;
        this.password = password;
        this.agreeTerms = agreeTerms;
        this.agreePrivacy = agreePrivacy;
        this.agreeThirdParty = agreeThirdParty;
        this.locationConsent = locationConsent;
    }

    public User toUser(String encodedPassword) {
        return User.builder()
                .email(email)
                .nickname(nickname)
                .password(encodedPassword)
                .agreeTerms(agreeTerms)
                .agreePrivacy(agreePrivacy)
                .agreeThirdParty(agreeThirdParty)
                .locationConsent(locationConsent)
                .build();
    }
}