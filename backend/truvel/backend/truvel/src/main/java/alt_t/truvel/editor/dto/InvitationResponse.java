package alt_t.truvel.editor.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
public class InvitationResponse {
    private Long editorId;
    private String status; // PENDING, ACCEPTED, REJECTED
    private String message;
}
