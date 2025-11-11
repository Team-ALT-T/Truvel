package alt_t.truvel.editor.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
//@Builder
//@AllArgsConstructor
public class EditorAddResponse { // 편집자 추가, 초대 수락/거절 기능에 사용

    @NotNull
    private String message;

    @NotNull
    private Long editorId;

//    @NotNull
//    private String editorNickname;


    @Builder
    public EditorAddResponse(String message, Long editorId) {
        this.message = message;
        this.editorId = editorId;
//        this.editorNickname = editorNickname;
    }

}