package alt_t.truvel.editor.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EditorAddRequest { // 여행계획에 편집자를 추가할때 요청 DTO

    // @NotNull
    // private Long travelPlanId;

    @NotNull
    private Long editorUserId; // 편집자로서 초대할 사용자의 id

    // @NotNull
    // private Long currentUserId; // 현재 요청을 보낸 사용자의 id
}