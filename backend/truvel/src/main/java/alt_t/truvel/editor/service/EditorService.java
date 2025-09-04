package alt_t.truvel.editor.service;

import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.auth.user.domain.repository.UserRepository;
import alt_t.truvel.editor.domain.entity.Editor;
import alt_t.truvel.editor.domain.repository.EditorRepository;
import alt_t.truvel.editor.dto.EditorAddResponse;
import alt_t.truvel.editor.dto.EditorSearchResponse;
import alt_t.truvel.editor.enums.EditorRole;
import alt_t.truvel.editor.enums.InvitationStatus;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EditorService {

    private final UserRepository userRepository;
    private final TravelPlanRepository travelPlanRepository;
    private final EditorRepository editorRepository;


    /**
     * 사용자를 검색하는 메서드
     * @param nickname : 검색하려는 사용자의 닉네임
     * @return : 검색된 사용자 1명
     */
    public EditorSearchResponse searchUsersByNickname(String nickname) {
        Optional<User> editor = userRepository.findByNicknameContainingIgnoreCase(nickname);

        // Optional에 값이 있다면, 있다면 해당 사용자 정보로 반환
        return editor.map(user -> EditorSearchResponse.builder()
                        .userId(user.getId())
                        .nickname(user.getNickname())
                        .profileImg(user.getProfileImg())
                        .email(user.getEmail())
                        .build())
                // 없다면, null 반환
                .orElse(null);
    }


    /**
     * 다른 사용자를 여행계획 편집자로 추가하는 메서드
     * @param travelPlanId : 여행계획 아이디
     * @param editorUserId : 추가하려는 편집자의 아이디
     * @param currentUserId : 현재 요청을 보내는 사용자의 아이디, 권한 확인후 중복 추가를 방지하기 위해 사용함
     * @return :
     */
    @Transactional
    public EditorAddResponse addEditorToTravelPlan(Long travelPlanId, Long editorUserId, Long currentUserId) {
        // 여행 계획 조회
        TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId)
                .orElseThrow(() -> new IllegalArgumentException("여행 계획을 찾을 수 없습니다."));

        // 추가할 편집자가 존재하는지 확인
        User editorUser = userRepository.findById(editorUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 요청을 보낸 사용자가 존재하는지 확인
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("현재 사용자를 찾을 수 없습니다."));

        // 요청을 보낸 사용자의 권한 확인, 해당 여행계획에서 권한이 있는지 확인
        boolean hasPermission = editorRepository.findByUserAndTravelPlan(currentUser, travelPlan).isPresent()
                || travelPlan.getUser().getId().equals(currentUserId);

        // 권한이 없다면, 메시지 반환
        if (!hasPermission) {
            return EditorAddResponse.builder()
                    .message("여행 계획에 친구를 추가할 권한이 없습니다.")
                    .build();
        }

        // 이미 편집자로 추가되어 있는지 확인
        if (editorRepository.existsByUserAndTravelPlan(editorUser, travelPlan)) {
            return EditorAddResponse.builder()
                    .message("이미 해당 여행 계획의 편집자입니다.")
                    .build();
        }

        // 자신을 추가하려는 경우 방지
        if (editorUserId.equals(currentUserId)) {
            return EditorAddResponse.builder()
                    .message("자기 자신을 편집자로 추가할 수 없습니다.")
                    .build();
        }

        // Editor 엔티티 생성
        Editor editor = Editor.builder()
                .user(editorUser) // 연관관계 매핑 (editor : user = N:1)
                .travelPlan(travelPlan) // 연관관계 매핑 (editor : TravelPlan = N:1)
                .role(EditorRole.EDITOR) // 권한은 편집자를 기본값으로 부여
                .status(InvitationStatus.PENDING)  // 초대 대기 상태를 기본값으로 설정
                .build();

        // 생성한 Editor 객체를 저장
        Editor savedEditor = editorRepository.save(editor);

        return EditorAddResponse.builder()
                .message(editorUser.getNickname() + "님에게 초대를 보냈습니다.")
                .editorId(savedEditor.getId())
                .build();
    }

    
    /**
     * 사용자가 받은 초대 목록들을 조회하는 메서드
     * @param userId : 사용자 아이디
     * @param status : 초대 상태
     * @return
     */
    public List<EditorSearchResponse> getUserInvitations(Long userId, String status) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 초대 상태 조회
        InvitationStatus invitationStatus = InvitationStatus.valueOf(status.toUpperCase());
        // 초대 상태를 기준으로 해당 상태에 맞는 초대 목록들을 조회
        List<Editor> invitations = editorRepository.findByUserAndStatusOrderByCreatedAtDesc(
                user, invitationStatus);

        // 초대 목록들을 반환
        return invitations.stream()
                .map(editor -> EditorSearchResponse.builder()
                        .userId(editor.getTravelPlan().getUser().getId())
                        .nickname(editor.getTravelPlan().getUser().getNickname())
                        .profileImg(editor.getTravelPlan().getUser().getProfileImg())
                        .email(editor.getTravelPlan().getUser().getEmail())
                        .status(editor.getStatus())
                        .build())
                .collect(Collectors.toList());
    }


    /**
     * 초대 대기 상태의 초대 목록들을 조회하는 메서드
     * @param userId : 사용자 아이디
     * @return : 초대 대기 상태의 초대 목록들을 반환
     */
    public List<EditorSearchResponse> getPendingInvitations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<Editor> pendingInvitations = editorRepository.findByUserAndStatusOrderByCreatedAtDesc(
                user, InvitationStatus.PENDING);

        return pendingInvitations.stream()
                .map(editor -> EditorSearchResponse.builder()
                        .userId(editor.getTravelPlan().getUser().getId())
                        .nickname(editor.getTravelPlan().getUser().getNickname())
                        .profileImg(editor.getTravelPlan().getUser().getProfileImg())
                        .email(editor.getTravelPlan().getUser().getEmail())
                        .status(editor.getStatus())
                        .build())
                .collect(Collectors.toList());
    }


    /**
     * 초대를 수락하는 메서드
     * @param editorId : 초대받은 편집자의 아이디
     * @param userId : 요청을 보내는 사용자 아이디, 초대 수락 기능을 이용할때 초대를 받은 사용자인지 확인하기 위해 사용함.
     * @return : 초대 수락 혹은 권한없음 메시지
     */
    @Transactional
    public EditorAddResponse acceptInvitation(Long editorId, Long userId) {
        // 유효성 검증 로직들

        // 1. 요청을 보낸 사용자와 편집자의 아이디가 일치하는지 확인
        Editor editor = editorRepository.findById(editorId)
                .orElseThrow(() -> new IllegalArgumentException("초대를 찾을 수 없습니다."));

        // 2. 권한 확인: 해당 초대의 대상자인지 확인
        if (!editor.getUser().getId().equals(userId)) { // 요청을 보낸 사용자와 편집자의 아이디가 일치하지 않는 경우
            return EditorAddResponse.builder()
                    .message("이 초대를 수락할 권한이 없습니다.")
                    .build();
        }

        // 3. 이미 처리된 초대인지 확인
        if (!editor.isPending()) { // status가 PENDING 상태가 아닌 경우
            return EditorAddResponse.builder()
                    .message("이미 처리된 초대입니다.")
                    .build();
        }

        // 초대 수락
        editor.acceptInvitation(); // 편집자의 초대 수락 여부를 ACCEPT로 변경
        editorRepository.save(editor); // 해당 상태를 저장

        return EditorAddResponse.builder()
                .message("초대를 수락했습니다.")
                .editorId(editor.getId())
                .build();
    }


    /**
     * 초대를 거절하는 메서드
     * @param editorId : 초대받은 편집자의 아이디
     * @param userId : 요청을 보내는 사용자 아이디, 초대 수락 기능을 이용할때 초대를 받은 사용자인지 확인하기 위해 사용함.
     * @return : 초대 거절 혹은 권한없음 메시지
     */
    @Transactional
    public EditorAddResponse rejectInvitation(Long editorId, Long userId) {
        Editor editor = editorRepository.findById(editorId)
                .orElseThrow(() -> new IllegalArgumentException("초대를 찾을 수 없습니다."));

        // 권한 확인: 해당 초대의 대상자인지 확인
        if (!editor.getUser().getId().equals(userId)) {
            return EditorAddResponse.builder()
                    .message("이 초대를 거절할 권한이 없습니다.")
                    .build();
        }

        // 이미 처리된 초대인지 확인
        if (!editor.isPending()) {
            return EditorAddResponse.builder()
                    .message("이미 처리된 초대입니다.")
                    .build();
        }

        // 초대 거절후 저장
        editor.rejectInvitation();
        editorRepository.save(editor);

        return EditorAddResponse.builder()
                .message("초대를 거절했습니다.")
                .editorId(editor.getId())
                .build();
    }

    /**
     * 여행계획의 편집자 목록을 조회하는 메서드 - 초대 수락 상태에 따라 조회
     * @param travelPlanId : 여행계획 아이디
     * @param status : 초대 수락 상태 - PENDING, REJECTED, ACCEPTED
     * @return : status에 해당하는 편집자 목록들을 불러옴
     */
    public List<EditorSearchResponse> getEditorsByStatus(Long travelPlanId, String status) {
        // 여행 계획 조회
        TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId)
                .orElseThrow(() -> new IllegalArgumentException("여행 계획을 찾을 수 없습니다."));

        // 초대 상태 조회
        InvitationStatus invitationStatus = InvitationStatus.valueOf(status.toUpperCase());
        // 초대 상태에 맞는 편집자 목록 조회
        List<Editor> editors = editorRepository.findByTravelPlanAndStatus(
                travelPlan, invitationStatus);
        
        return editors.stream()
                .map(editor -> EditorSearchResponse.builder()
                        .userId(editor.getUser().getId()) // 편집자의 userId
                        .nickname(editor.getUser().getNickname()) // 편집자의 닉네임
                        .profileImg(editor.getUser().getProfileImg()) // 편집자의 프로필 이미지
                        .email(editor.getUser().getEmail()) // 편집자의 이메일
                        .status(editor.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 여행계획의 모든 초대 대상자(편집자) 목록을 조회하는 메서드 - 상태 구분 없이 전체 반환
     * @param travelPlanId : 여행계획 아이디
     * @return : 해당 여행계획에 초대된 모든 사용자 목록
     */
    public List<EditorSearchResponse> getEditors(Long travelPlanId) {
        TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId)
                .orElseThrow(() -> new IllegalArgumentException("여행 계획을 찾을 수 없습니다."));

        List<Editor> editors = editorRepository.findByTravelPlan(travelPlan);

        return editors.stream()
                .map(editor -> EditorSearchResponse.builder()
                        .userId(editor.getUser().getId())
                        .nickname(editor.getUser().getNickname())
                        .profileImg(editor.getUser().getProfileImg())
                        .email(editor.getUser().getEmail())
                        .status(editor.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

}