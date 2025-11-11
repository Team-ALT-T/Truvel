package alt_t.truvel.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;

//@Schema(description = "로그인 요청 DTO")
@Getter
public class LoginRequest {

    //    @Schema(description = "사용자 이메일", example = "daiseek123")
    @NotBlank(message = "이메일을 입력해주세요.")
    private String email;

    //    @Schema(description = "사용자 비밀번호", example = "1234")
    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;

    @Builder
    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }
}