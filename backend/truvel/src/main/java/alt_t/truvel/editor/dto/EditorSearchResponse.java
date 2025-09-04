package alt_t.truvel.editor.dto;

import alt_t.truvel.editor.enums.InvitationStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
// @JsonInclude(JsonInclude.Include.NON_NULL)
public class EditorSearchResponse {

    @NotNull
    private Long userId;

    @NotNull
    private String nickname;

    private String profileImg;

    @NotNull
    private String email;

    // 초대 수락 여부 (PENDING, ACCEPTED, REJECTED). 사용자 검색 응답에서는 null일 수 있음
    private InvitationStatus status;
}