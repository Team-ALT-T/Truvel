package alt_t.truvel.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;

//@Schema(description = "로그인 응답 DTO")
@Getter
public class LoginResponse {

//    @Schema(description = "로그인 성공시 메시지")
    private String message;

//    @Schema(description = "사용자의 액세스 토큰")
    @NotBlank
    private String accessToken;


//    @Schema(description = "권한 종류")
    @NotBlank
    private String grantType;

//    @Schema(description = "사용자의 리프레시 토큰")
    @NotBlank
    private String refreshToken;


    @Builder
    public LoginResponse(String message, String accessToken, String refreshToken, String grantType) {
        this.message = message;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.grantType = grantType;
    }


    /**
     * 로그인 성공시 사용
     * @param message : 로그인 성공 메시지
     * @param accessToken : 사용자가 받은 액세스 토큰
     * @param refreshToken : 리프레시 토큰
     * @param grantType : 사용자가 할당받은 권한
     * @return : LoginResponse 생성자에 의해 가공된 데이터
     */
    public static LoginResponse from(String message, String accessToken, String refreshToken,  String grantType) {
        return LoginResponse.builder()
                .message(message)
                .grantType(grantType)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }


}