package alt_t.truvel.editor;

import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.auth.user.domain.repository.UserRepository;
import alt_t.truvel.editor.domain.entity.Editor;
import alt_t.truvel.editor.domain.repository.EditorRepository;
import alt_t.truvel.editor.dto.EditorAddResponse;
import alt_t.truvel.editor.dto.EditorSearchResponse;
import alt_t.truvel.editor.enums.EditorRole;
import alt_t.truvel.editor.enums.InvitationStatus;
import alt_t.truvel.editor.service.EditorService;
import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

/**
 * EditorService의 단위 테스트 - Mock을 사용하여 의존성을 격리
 */
@ExtendWith(MockitoExtension.class)
class EditorServiceUnitTest {

    @Mock private UserRepository userRepository;
    @Mock private TravelPlanRepository travelPlanRepository;
    @Mock private EditorRepository editorRepository;

    @InjectMocks private EditorService editorService;

    // 테스트용 Mock 데이터
    private User mockOwnerUser;
    private User mockEditorUser;
    private User mockSearchUser;
    private TravelPlan mockTravelPlan;
    private Editor mockEditor;
    private Country mockCountry;
    private City mockCity;

    @BeforeEach
    void setUp() {
        // Mock 객체들 초기화
        mockOwnerUser = User.builder()
                .email("owner@example.com")
                .password("password123")
                .nickname("여행플래너")
                .build();
        // 리플렉션을 사용하여 ID 설정
        setId(mockOwnerUser, 1L);

        mockEditorUser = User.builder()
                .email("editor@example.com")
                .password("password123")
                .nickname("친구")
                .build();
        setId(mockEditorUser, 2L);

        mockSearchUser = User.builder()
                .email("search@example.com")
                .password("password123")
                .nickname("검색대상")
                .build();
        setId(mockSearchUser, 3L);

        mockCountry = new Country("대한민국", "Korea");
        mockCity = new City("서울", "Seoul", mockCountry);

        mockTravelPlan = TravelPlan.builder()
                .nationId(mockCountry)
                .cityId(mockCity)
                .cityName("서울")
                .nationName("대한민국")
                .startDate(LocalDate.of(2025, 1, 1))
                .endDate(LocalDate.of(2025, 1, 5))
                .user(mockOwnerUser)
                .build();
        setId(mockTravelPlan, 1L);

        mockEditor = Editor.builder()
                .user(mockEditorUser)
                .travelPlan(mockTravelPlan)
                .role(EditorRole.EDITOR)
                .status(InvitationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        setId(mockEditor, 1L);
    }

    // 리플렉션을 사용하여 Entity의 ID를 설정하는 유틸리티 메서드
    private void setId(Object entity, Long id) {
        try {
            Field idField = entity.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException("ID 설정 실패", e);
        }
    }

    @Test
    @DisplayName("닉네임으로 사용자 검색 성공 테스트")
    void searchUsersByNickname_Success() {
        // given
        String nickname = "검색대상";
        given(userRepository.findByNicknameContainingIgnoreCase(nickname))
                .willReturn(Optional.of(mockSearchUser));

        // when
        EditorSearchResponse response = editorService.searchUsersByNickname(nickname);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(mockSearchUser.getId());
        assertThat(response.getNickname()).isEqualTo("검색대상");
        assertThat(response.getEmail()).isEqualTo("search@example.com");

        verify(userRepository).findByNicknameContainingIgnoreCase(nickname);
    }

    @Test
    @DisplayName("존재하지 않는 닉네임 검색시 null 반환 테스트")
    void searchUsersByNickname_NotFound() {
        // given
        String nickname = "존재하지않는사용자";
        given(userRepository.findByNicknameContainingIgnoreCase(nickname))
                .willReturn(Optional.empty());

        // when
        EditorSearchResponse response = editorService.searchUsersByNickname(nickname);

        // then
        assertThat(response).isNull();
        verify(userRepository).findByNicknameContainingIgnoreCase(nickname);
    }

    @Test
    @DisplayName("여행 계획에 편집자 추가 성공 테스트")
    void addEditorToTravelPlan_Success() {
        // given
        Long travelPlanId = 1L;
        Long editorUserId = 2L;
        Long currentUserId = 1L;

        given(travelPlanRepository.findById(travelPlanId)).willReturn(Optional.of(mockTravelPlan));
        given(userRepository.findById(editorUserId)).willReturn(Optional.of(mockEditorUser));
        given(userRepository.findById(currentUserId)).willReturn(Optional.of(mockOwnerUser));
        given(editorRepository.findByUserAndTravelPlan(mockOwnerUser, mockTravelPlan))
                .willReturn(Optional.empty());
        given(editorRepository.existsByUserAndTravelPlan(mockEditorUser, mockTravelPlan))
                .willReturn(false);
        given(editorRepository.save(any(Editor.class))).willReturn(mockEditor);

        // when
        EditorAddResponse response = editorService.addEditorToTravelPlan(
                travelPlanId, editorUserId, currentUserId);

        // then
        assertThat(response.getMessage()).isEqualTo("친구님에게 초대를 보냈습니다.");
        assertThat(response.getEditorId()).isEqualTo(1L);

        verify(travelPlanRepository).findById(travelPlanId);
        verify(userRepository).findById(editorUserId);
        verify(userRepository).findById(currentUserId);
        verify(editorRepository).existsByUserAndTravelPlan(mockEditorUser, mockTravelPlan);
        verify(editorRepository).save(any(Editor.class));
    }

    @Test
    @DisplayName("여행 계획에 편집자 추가 실패 - 여행 계획을 찾을 수 없음")
    void addEditorToTravelPlan_TravelPlanNotFound() {
        // given
        Long travelPlanId = 999L;
        Long editorUserId = 2L;
        Long currentUserId = 1L;

        given(travelPlanRepository.findById(travelPlanId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> editorService.addEditorToTravelPlan(
                travelPlanId, editorUserId, currentUserId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("여행 계획을 찾을 수 없습니다.");

        verify(travelPlanRepository).findById(travelPlanId);
        verify(userRepository, never()).findById(anyLong());
        verify(editorRepository, never()).save(any(Editor.class));
    }

    @Test
    @DisplayName("여행 계획에 편집자 추가 실패 - 편집자 사용자를 찾을 수 없음")
    void addEditorToTravelPlan_EditorUserNotFound() {
        // given
        Long travelPlanId = 1L;
        Long editorUserId = 999L;
        Long currentUserId = 1L;

        given(travelPlanRepository.findById(travelPlanId)).willReturn(Optional.of(mockTravelPlan));
        given(userRepository.findById(editorUserId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> editorService.addEditorToTravelPlan(
                travelPlanId, editorUserId, currentUserId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("사용자를 찾을 수 없습니다.");

        verify(travelPlanRepository).findById(travelPlanId);
        verify(userRepository).findById(editorUserId);
        verify(editorRepository, never()).save(any(Editor.class));
    }

    @Test
    @DisplayName("여행 계획에 편집자 추가 실패 - 권한이 없음")
    void addEditorToTravelPlan_NoPermission() {
        // given
        Long travelPlanId = 1L;
        Long editorUserId = 2L;
        Long currentUserId = 3L; // 권한이 없는 사용자

        User unauthorizedUser = User.builder()
                .email("unauthorized@example.com")
                .password("password123")
                .nickname("권한없음")
                .build();
        setId(unauthorizedUser, 3L);

        given(travelPlanRepository.findById(travelPlanId)).willReturn(Optional.of(mockTravelPlan));
        given(userRepository.findById(editorUserId)).willReturn(Optional.of(mockEditorUser));
        given(userRepository.findById(currentUserId)).willReturn(Optional.of(unauthorizedUser));
        given(editorRepository.findByUserAndTravelPlan(unauthorizedUser, mockTravelPlan))
                .willReturn(Optional.empty());

        // when
        EditorAddResponse response = editorService.addEditorToTravelPlan(
                travelPlanId, editorUserId, currentUserId);

        // then
        assertThat(response.getMessage()).isEqualTo("여행 계획에 친구를 추가할 권한이 없습니다.");
        assertThat(response.getEditorId()).isNull();

        verify(editorRepository, never()).save(any(Editor.class));
    }

    @Test
    @DisplayName("여행 계획에 편집자 추가 실패 - 자기 자신을 추가하려 함")
    void addEditorToTravelPlan_SelfInvitation() {
        // given
        Long travelPlanId = 1L;
        Long userId = 1L; // 동일한 사용자 ID

        given(travelPlanRepository.findById(travelPlanId)).willReturn(Optional.of(mockTravelPlan));
        given(userRepository.findById(userId)).willReturn(Optional.of(mockOwnerUser));

        // when
        EditorAddResponse response = editorService.addEditorToTravelPlan(
                travelPlanId, userId, userId);

        // then
        assertThat(response.getMessage()).isEqualTo("자기 자신을 편집자로 추가할 수 없습니다.");
        assertThat(response.getEditorId()).isNull();

        verify(editorRepository, never()).save(any(Editor.class));
    }

    @Test
    @DisplayName("여행 계획에 편집자 추가 실패 - 이미 추가된 편집자")
    void addEditorToTravelPlan_AlreadyExists() {
        // given
        Long travelPlanId = 1L;
        Long editorUserId = 2L;
        Long currentUserId = 1L;

        given(travelPlanRepository.findById(travelPlanId)).willReturn(Optional.of(mockTravelPlan));
        given(userRepository.findById(editorUserId)).willReturn(Optional.of(mockEditorUser));
        given(userRepository.findById(currentUserId)).willReturn(Optional.of(mockOwnerUser));
        given(editorRepository.findByUserAndTravelPlan(mockOwnerUser, mockTravelPlan))
                .willReturn(Optional.empty());
        given(editorRepository.existsByUserAndTravelPlan(mockEditorUser, mockTravelPlan))
                .willReturn(true);

        // when
        EditorAddResponse response = editorService.addEditorToTravelPlan(
                travelPlanId, editorUserId, currentUserId);

        // then
        assertThat(response.getMessage()).isEqualTo("이미 해당 여행 계획의 편집자입니다.");
        assertThat(response.getEditorId()).isNull();

        verify(editorRepository, never()).save(any(Editor.class));
    }

    @Test
    @DisplayName("초대 수락 성공 테스트")
    void acceptInvitation_Success() {
        // given
        Long editorId = 1L;
        Long userId = 2L;

        Editor pendingEditor = Editor.builder()
                .user(mockEditorUser)
                .travelPlan(mockTravelPlan)
                .role(EditorRole.EDITOR)
                .status(InvitationStatus.PENDING)
                .build();
        setId(pendingEditor, 1L);

        given(editorRepository.findById(editorId)).willReturn(Optional.of(pendingEditor));
        given(editorRepository.save(any(Editor.class))).willReturn(pendingEditor);

        // when
        EditorAddResponse response = editorService.acceptInvitation(editorId, userId);

        // then
        assertThat(response.getMessage()).isEqualTo("초대를 수락했습니다.");
        assertThat(response.getEditorId()).isEqualTo(1L);

        verify(editorRepository).findById(editorId);
        verify(editorRepository).save(pendingEditor);
    }

    @Test
    @DisplayName("초대 수락 실패 - 편집자를 찾을 수 없음")
    void acceptInvitation_EditorNotFound() {
        // given
        Long editorId = 999L;
        Long userId = 2L;

        given(editorRepository.findById(editorId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> editorService.acceptInvitation(editorId, userId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("초대를 찾을 수 없습니다.");

        verify(editorRepository).findById(editorId);
        verify(editorRepository, never()).save(any(Editor.class));
    }

    @Test
    @DisplayName("초대 수락 실패 - 권한이 없음")
    void acceptInvitation_NoPermission() {
        // given
        Long editorId = 1L;
        Long wrongUserId = 999L;

        given(editorRepository.findById(editorId)).willReturn(Optional.of(mockEditor));

        // when
        EditorAddResponse response = editorService.acceptInvitation(editorId, wrongUserId);

        // then
        assertThat(response.getMessage()).isEqualTo("이 초대를 수락할 권한이 없습니다.");
        assertThat(response.getEditorId()).isNull();

        verify(editorRepository, never()).save(any(Editor.class));
    }

    @Test
    @DisplayName("초대 수락 실패 - 이미 처리된 초대")
    void acceptInvitation_AlreadyProcessed() {
        // given
        Long editorId = 1L;
        Long userId = 2L;

        Editor acceptedEditor = Editor.builder()
                .user(mockEditorUser)
                .travelPlan(mockTravelPlan)
                .role(EditorRole.EDITOR)
                .status(InvitationStatus.ACCEPTED)
                .build();
        setId(acceptedEditor, 1L);

        given(editorRepository.findById(editorId)).willReturn(Optional.of(acceptedEditor));

        // when
        EditorAddResponse response = editorService.acceptInvitation(editorId, userId);

        // then
        assertThat(response.getMessage()).isEqualTo("이미 처리된 초대입니다.");
        assertThat(response.getEditorId()).isNull();

        verify(editorRepository, never()).save(any(Editor.class));
    }

    @Test
    @DisplayName("초대 거절 성공 테스트")
    void rejectInvitation_Success() {
        // given
        Long editorId = 1L;
        Long userId = 2L;

        Editor pendingEditor = Editor.builder()
                .user(mockEditorUser)
                .travelPlan(mockTravelPlan)
                .role(EditorRole.EDITOR)
                .status(InvitationStatus.PENDING)
                .build();
        setId(pendingEditor, 1L);

        given(editorRepository.findById(editorId)).willReturn(Optional.of(pendingEditor));
        given(editorRepository.save(any(Editor.class))).willReturn(pendingEditor);

        // when
        EditorAddResponse response = editorService.rejectInvitation(editorId, userId);

        // then
        assertThat(response.getMessage()).isEqualTo("초대를 거절했습니다.");
        assertThat(response.getEditorId()).isEqualTo(1L);

        verify(editorRepository).findById(editorId);
        verify(editorRepository).save(pendingEditor);
    }

    @Test
    @DisplayName("대기중인 초대 목록 조회 성공 테스트")
    void getPendingInvitations_Success() {
        // given
        Long userId = 2L;
        List<Editor> pendingEditors = Arrays.asList(mockEditor);

        given(userRepository.findById(userId)).willReturn(Optional.of(mockEditorUser));
        given(editorRepository.findByUserAndStatusOrderByCreatedAtDesc(
                mockEditorUser, InvitationStatus.PENDING)).willReturn(pendingEditors);

        // when
        List<EditorSearchResponse> responses = editorService.getPendingInvitations(userId);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getUserId()).isEqualTo(mockOwnerUser.getId());
        assertThat(responses.get(0).getNickname()).isEqualTo("여행플래너");
        assertThat(responses.get(0).getStatus()).isEqualTo(InvitationStatus.PENDING);

        verify(userRepository).findById(userId);
        verify(editorRepository).findByUserAndStatusOrderByCreatedAtDesc(
                mockEditorUser, InvitationStatus.PENDING);
    }

    @Test
    @DisplayName("대기중인 초대 목록 조회 실패 - 사용자를 찾을 수 없음")
    void getPendingInvitations_UserNotFound() {
        // given
        Long userId = 999L;
        given(userRepository.findById(userId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> editorService.getPendingInvitations(userId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("사용자를 찾을 수 없습니다.");

        verify(userRepository).findById(userId);
        verify(editorRepository, never()).findByUserAndStatusOrderByCreatedAtDesc(
                any(User.class), any(InvitationStatus.class));
    }

    @Test
    @DisplayName("여행 계획의 편집자 목록 조회 성공 테스트")
    void getEditors_Success() {
        // given
        Long travelPlanId = 1L;
        List<Editor> editors = Arrays.asList(mockEditor);

        given(travelPlanRepository.findById(travelPlanId)).willReturn(Optional.of(mockTravelPlan));
        given(editorRepository.findByTravelPlan(mockTravelPlan)).willReturn(editors);

        // when
        List<EditorSearchResponse> responses = editorService.getEditors(travelPlanId);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getUserId()).isEqualTo(mockEditorUser.getId());
        assertThat(responses.get(0).getNickname()).isEqualTo("친구");
        assertThat(responses.get(0).getStatus()).isEqualTo(InvitationStatus.PENDING);

        verify(travelPlanRepository).findById(travelPlanId);
        verify(editorRepository).findByTravelPlan(mockTravelPlan);
    }

    @Test
    @DisplayName("특정 상태의 편집자 목록 조회 성공 테스트")
    void getEditorsByStatus_Success() {
        // given
        Long travelPlanId = 1L;
        String status = "PENDING";
        List<Editor> editors = Arrays.asList(mockEditor);

        given(travelPlanRepository.findById(travelPlanId)).willReturn(Optional.of(mockTravelPlan));
        given(editorRepository.findByTravelPlanAndStatus(mockTravelPlan, InvitationStatus.PENDING))
                .willReturn(editors);

        // when
        List<EditorSearchResponse> responses = editorService.getEditorsByStatus(travelPlanId, status);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getUserId()).isEqualTo(mockEditorUser.getId());
        assertThat(responses.get(0).getStatus()).isEqualTo(InvitationStatus.PENDING);

        verify(travelPlanRepository).findById(travelPlanId);
        verify(editorRepository).findByTravelPlanAndStatus(mockTravelPlan, InvitationStatus.PENDING);
    }

    @Test
    @DisplayName("사용자별 초대 상태 조회 성공 테스트")
    void getUserInvitations_Success() {
        // given
        Long userId = 2L;
        String status = "PENDING";
        List<Editor> invitations = Arrays.asList(mockEditor);

        given(userRepository.findById(userId)).willReturn(Optional.of(mockEditorUser));
        given(editorRepository.findByUserAndStatusOrderByCreatedAtDesc(
                mockEditorUser, InvitationStatus.PENDING)).willReturn(invitations);

        // when
        List<EditorSearchResponse> responses = editorService.getUserInvitations(userId, status);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getUserId()).isEqualTo(mockOwnerUser.getId());
        assertThat(responses.get(0).getStatus()).isEqualTo(InvitationStatus.PENDING);

        verify(userRepository).findById(userId);
        verify(editorRepository).findByUserAndStatusOrderByCreatedAtDesc(
                mockEditorUser, InvitationStatus.PENDING);
    }
}
