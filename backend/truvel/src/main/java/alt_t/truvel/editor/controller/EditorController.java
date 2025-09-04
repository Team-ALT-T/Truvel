package alt_t.truvel.editor.controller;

import alt_t.truvel.auth.security.UserPrincipal;
import alt_t.truvel.editor.dto.*;
import java.util.List;
import alt_t.truvel.editor.service.EditorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class EditorController {

    private final EditorService editorService;

    // ========== 사용자 검색 ==========
    
    /**
     * 사용자 검색 (닉네임으로 검색) - 친구검색
     * @param nickname 검색할 닉네임 (쿼리 파라미터)
     * @return 검색된 사용자 목록
     */
    @GetMapping("/editors")
    public ResponseEntity<EditorSearchResponse> searchUsers(
            @RequestParam String nickname) {
        EditorSearchResponse response = editorService.searchUsersByNickname(nickname);
        return (response == null) ? ResponseEntity.noContent().build()
                                : ResponseEntity.ok(response);

    }



    // ========== 여행 계획 편집자 ==========

    /**
     * 특정 여행 계획의 편집자 목록 조회 - 상태 구분 없이 전체 반환
     * @param travelPlanId 여행 계획 ID
     * @return 편집자 목록
     */
    @GetMapping("/travels/{travelPlanId}/editors")
    public ResponseEntity<List<EditorSearchResponse>> getTravelPlanEditors(
            @PathVariable Long travelPlanId) {
        List<EditorSearchResponse> editors = editorService.getEditors(travelPlanId);
        return ResponseEntity.ok(editors);
    }


    /**
     * 여행 계획에 편집자 추가 - 친구등록
     * @param travelPlanId 여행 계획 ID
     * @param request 초대할 사용자 정보
     * @return 초대 결과
     */
    @PostMapping("/travels/{travelPlanId}/editors")
    public ResponseEntity<EditorAddResponse> inviteEditor(
            @PathVariable Long travelPlanId,
            @RequestBody EditorAddRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        EditorAddResponse response = editorService.addEditorToTravelPlan(
                travelPlanId, 
                request.getEditorUserId(),
                userPrincipal.getId()
        );
        return ResponseEntity.ok(response);
    }



    // ========== 초대 관련 ==========

    /**
     * 사용자가 받은 초대 목록 조회
     * @param userId 사용자 ID
     * @param status 초대 상태 (선택적, 기본값: PENDING)
     * @return 초대 목록
     */
    // @GetMapping("/users/{userId}/invitations")
    // public ResponseEntity<List<EditorSearchResponse>> getUserInvitations(
    //         @PathVariable Long userId,
    //         @RequestParam(defaultValue = "PENDING") String status) {
    //     List<EditorSearchResponse> invitations = editorService.getUserInvitations(userId, status);
    //     return ResponseEntity.ok(invitations);
    // }

    /**
     * 여행계획 초대 수락
     * @param editorId 편집자(Editor) id, 초대받은 사용자의 아이디
     * @param userPrincipal 인증된 사용자 정보, 요청을 보내는 사용자의 정보를 담는 객체
     * Note. editorId와 userId 둘 다 쓰는 이유는 초대받은 사람과 요청을 보내는 사람이 동일 사용자인지 판단하기 위함이다.
     * @return 수락 결과
     */
    @PutMapping("/editors/{editorId}/accept")
    public ResponseEntity<EditorAddResponse> acceptInvitation(
            @PathVariable Long editorId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        EditorAddResponse response = editorService.acceptInvitation(
                editorId,
                userPrincipal.getId()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * 여행계획 초대 거절
     * @param editorId 편집자(Editor) id, 초대받은 사용자의 아이디
     * @param userPrincipal 인증된 사용자 정보, 요청을 보내는 사용자의 정보를 담는 객체
     * Note. editorId와 userId 둘 다 쓰는 이유는 초대받은 사람과 요청을 보내는 사람이 동일 사용자인지 판단하기 위함이다.
     * @return 거절 결과
     */
    @PutMapping("/editors/{editorId}/reject")
    public ResponseEntity<EditorAddResponse> rejectInvitation(
            @PathVariable Long editorId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        EditorAddResponse response = editorService.rejectInvitation(
                editorId,
                userPrincipal.getId()
        );
        return ResponseEntity.ok(response);
    }
}