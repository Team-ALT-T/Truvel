package alt_t.truvel.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SignUpResponse {

//    @Schema(description = "성공 응답 메시지")
    private String message;

//    @Schema(description = "사용자 아이디")
    @NotBlank
    private Long userId;

    @Builder
    public SignUpResponse(String message, Long userId) {
        this.message = message;
        this.userId = userId;
    }


    /**
     * 회원가입 성공시 반환
     * @param message : 응답 메시지
     * @param userId : DB에 저장된 사용자 아이디
     * @return : 성공 메시지와 사용자의 아이디
     */
    public static SignUpResponse of(String message, Long userId) {
        return SignUpResponse.builder()
                .message(message)
                .userId(userId)
                .build();
    }


}
