package alt_t.truvel.editor;

import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.auth.user.domain.repository.UserRepository;
import alt_t.truvel.editor.domain.entity.Editor;
import alt_t.truvel.editor.domain.repository.EditorRepository;
import alt_t.truvel.editor.dto.EditorAddResponse;
import alt_t.truvel.editor.dto.EditorSearchResponse;
import alt_t.truvel.editor.enums.InvitationStatus;
import alt_t.truvel.editor.service.EditorService;
import alt_t.truvel.searchCountryAndCity.domain.entity.City;
import alt_t.truvel.searchCountryAndCity.domain.entity.Country;
import alt_t.truvel.searchCountryAndCity.domain.repository.CityRepository;
import alt_t.truvel.searchCountryAndCity.domain.repository.CountryRepository;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * EditorService의 통합 테스트 - 관련 구현체를 모두 주입받아 진행
 */
@SpringBootTest
@ActiveProfiles("test")
class EditorServiceIntegrationTest {

    @Autowired private EditorService editorService;
    @Autowired private EditorRepository editorRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TravelPlanRepository travelPlanRepository;
    @Autowired private CountryRepository countryRepository;
    @Autowired private CityRepository cityRepository;

    // 테스트용 엔티티들
    private User ownerUser;
    private User editorUser;
    private User searchUser;
    private TravelPlan travelPlan;
    private Country country;
    private City city;

    @BeforeEach
    void setUp() {
        // 데이터 초기화 (테스트 격리)
        editorRepository.deleteAllInBatch();
        travelPlanRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        cityRepository.deleteAllInBatch();
        countryRepository.deleteAllInBatch();

        // 1. 테스트용 국가/도시 데이터 저장
        country = new Country("대한민국", "Korea");
        countryRepository.save(country);

        city = new City("서울", "Seoul", country);
        cityRepository.save(city);

        // 2. 테스트용 사용자들 생성
        ownerUser = User.builder()
                .email("owner@example.com")
                .password("password123")
                .nickname("여행플래너")
                .build();
        userRepository.save(ownerUser);

        editorUser = User.builder()
                .email("editor@example.com")
                .password("password123")
                .nickname("친구")
                .build();
        userRepository.save(editorUser);

        searchUser = User.builder()
                .email("search@example.com")
                .password("password123")
                .nickname("검색대상")
                .build();
        userRepository.save(searchUser);

        // 3. 테스트용 여행 계획 생성
        travelPlan = TravelPlan.builder()
                .nationId(country)
                .cityId(city)
                .cityName("서울")
                .nationName("대한민국")
                .startDate(LocalDate.of(2025, 1, 1))
                .endDate(LocalDate.of(2025, 1, 5))
                .user(ownerUser)
                .build();
        travelPlanRepository.save(travelPlan);
    }

    @AfterEach
    void tearDown() {
        editorRepository.deleteAllInBatch();
        travelPlanRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        cityRepository.deleteAllInBatch();
        countryRepository.deleteAllInBatch();
    }

    @Test
    @DisplayName("닉네임으로 사용자 검색이 정상적으로 동작한다")
    void searchUsersByNickname_Success() {
        // given
        String searchNickname = "검색대상";

        // when
        EditorSearchResponse response = editorService.searchUsersByNickname(searchNickname);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(searchUser.getId());
        assertThat(response.getNickname()).isEqualTo("검색대상");
        assertThat(response.getEmail()).isEqualTo("search@example.com");
    }

    @Test
    @DisplayName("존재하지 않는 닉네임으로 검색시 null을 반환한다")
    void searchUsersByNickname_NotFound() {
        // given
        String nonExistentNickname = "존재하지않는사용자";

        // when
        EditorSearchResponse response = editorService.searchUsersByNickname(nonExistentNickname);

        // then
        assertThat(response).isNull();
    }

    @Test
    @DisplayName("여행 계획에 편집자 추가가 정상적으로 동작한다")
    void addEditorToTravelPlan_Success() {
        // given
        Long travelPlanId = travelPlan.getId();
        Long editorUserId = editorUser.getId();
        Long currentUserId = ownerUser.getId();

        // when
        EditorAddResponse response = editorService.addEditorToTravelPlan(
                travelPlanId, editorUserId, currentUserId);

        // then
        assertThat(response.getMessage()).isEqualTo("친구님에게 초대를 보냈습니다.");
        assertThat(response.getEditorId()).isNotNull();

        // DB에 실제로 저장되었는지 확인
        Editor savedEditor = editorRepository.findById(response.getEditorId()).orElse(null);
        assertThat(savedEditor).isNotNull();
        assertThat(savedEditor.getUser().getId()).isEqualTo(editorUserId);
        assertThat(savedEditor.getTravelPlan().getId()).isEqualTo(travelPlanId);
        assertThat(savedEditor.getStatus()).isEqualTo(InvitationStatus.PENDING);
    }

    @Test
    @DisplayName("권한이 없는 사용자가 편집자 추가를 시도하면 실패한다")
    void addEditorToTravelPlan_NoPermission() {
        // given
        Long travelPlanId = travelPlan.getId();
        Long editorUserId = editorUser.getId();
        Long unauthorizedUserId = searchUser.getId(); // 권한이 없는 사용자

        // when
        EditorAddResponse response = editorService.addEditorToTravelPlan(
                travelPlanId, editorUserId, unauthorizedUserId);

        // then
        assertThat(response.getMessage()).isEqualTo("여행 계획에 친구를 추가할 권한이 없습니다.");
        assertThat(response.getEditorId()).isNull();
    }

    @Test
    @DisplayName("자기 자신을 편집자로 추가하려 하면 실패한다")
    void addEditorToTravelPlan_SelfInvitation() {
        // given
        Long travelPlanId = travelPlan.getId();
        Long currentUserId = ownerUser.getId();

        // when
        EditorAddResponse response = editorService.addEditorToTravelPlan(
                travelPlanId, currentUserId, currentUserId);

        // then
        assertThat(response.getMessage()).isEqualTo("자기 자신을 편집자로 추가할 수 없습니다.");
        assertThat(response.getEditorId()).isNull();
    }

    @Test
    @DisplayName("이미 추가된 편집자를 다시 추가하려 하면 실패한다")
    void addEditorToTravelPlan_AlreadyExists() {
        // given
        // 먼저 편집자 추가
        editorService.addEditorToTravelPlan(travelPlan.getId(), editorUser.getId(), ownerUser.getId());

        // when - 같은 편집자를 다시 추가 시도
        EditorAddResponse response = editorService.addEditorToTravelPlan(
                travelPlan.getId(), editorUser.getId(), ownerUser.getId());

        // then
        assertThat(response.getMessage()).isEqualTo("이미 해당 여행 계획의 편집자입니다.");
        assertThat(response.getEditorId()).isNull();
    }

    @Test
    @DisplayName("존재하지 않는 여행 계획에 편집자 추가 시도시 예외가 발생한다")
    void addEditorToTravelPlan_TravelPlanNotFound() {
        // given
        Long nonExistentTravelPlanId = 999L;
        Long editorUserId = editorUser.getId();
        Long currentUserId = ownerUser.getId();

        // when & then
        assertThatThrownBy(() -> editorService.addEditorToTravelPlan(
                nonExistentTravelPlanId, editorUserId, currentUserId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("여행 계획을 찾을 수 없습니다.");
    }

    @Test
    @DisplayName("초대 수락이 정상적으로 동작한다")
    void acceptInvitation_Success() {
        // given
        EditorAddResponse addResponse = editorService.addEditorToTravelPlan(
                travelPlan.getId(), editorUser.getId(), ownerUser.getId());
        Long editorId = addResponse.getEditorId();

        // when
        EditorAddResponse response = editorService.acceptInvitation(editorId, editorUser.getId());

        // then
        assertThat(response.getMessage()).isEqualTo("초대를 수락했습니다.");
        assertThat(response.getEditorId()).isEqualTo(editorId);

        // DB에서 상태 확인
        Editor savedEditor = editorRepository.findById(editorId).orElse(null);
        assertThat(savedEditor).isNotNull();
        assertThat(savedEditor.getStatus()).isEqualTo(InvitationStatus.ACCEPTED);
    }

    @Test
    @DisplayName("권한이 없는 사용자가 초대 수락을 시도하면 실패한다")
    void acceptInvitation_NoPermission() {
        // given
        EditorAddResponse addResponse = editorService.addEditorToTravelPlan(
                travelPlan.getId(), editorUser.getId(), ownerUser.getId());
        Long editorId = addResponse.getEditorId();

        // when - 다른 사용자가 수락 시도
        EditorAddResponse response = editorService.acceptInvitation(editorId, searchUser.getId());

        // then
        assertThat(response.getMessage()).isEqualTo("이 초대를 수락할 권한이 없습니다.");
        assertThat(response.getEditorId()).isNull();
    }

    @Test
    @DisplayName("초대 거절이 정상적으로 동작한다")
    void rejectInvitation_Success() {
        // given
        EditorAddResponse addResponse = editorService.addEditorToTravelPlan(
                travelPlan.getId(), editorUser.getId(), ownerUser.getId());
        Long editorId = addResponse.getEditorId();

        // when
        EditorAddResponse response = editorService.rejectInvitation(editorId, editorUser.getId());

        // then
        assertThat(response.getMessage()).isEqualTo("초대를 거절했습니다.");
        assertThat(response.getEditorId()).isEqualTo(editorId);

        // DB에서 상태 확인
        Editor savedEditor = editorRepository.findById(editorId).orElse(null);
        assertThat(savedEditor).isNotNull();
        assertThat(savedEditor.getStatus()).isEqualTo(InvitationStatus.REJECTED);
    }

    @Test
    @DisplayName("이미 처리된 초대를 다시 수락하려 하면 실패한다")
    void acceptInvitation_AlreadyProcessed() {
        // given
        EditorAddResponse addResponse = editorService.addEditorToTravelPlan(
                travelPlan.getId(), editorUser.getId(), ownerUser.getId());
        Long editorId = addResponse.getEditorId();

        // 먼저 수락
        editorService.acceptInvitation(editorId, editorUser.getId());

        // when - 다시 수락 시도
        EditorAddResponse response = editorService.acceptInvitation(editorId, editorUser.getId());

        // then
        assertThat(response.getMessage()).isEqualTo("이미 처리된 초대입니다.");
        assertThat(response.getEditorId()).isNull();
    }

    @Test
    @DisplayName("사용자의 대기중인 초대 목록 조회가 정상적으로 동작한다")
    void getPendingInvitations_Success() {
        // given
        // 초대 생성
        editorService.addEditorToTravelPlan(travelPlan.getId(), editorUser.getId(), ownerUser.getId());

        // when
        List<EditorSearchResponse> invitations = editorService.getPendingInvitations(editorUser.getId());

        // then
        assertThat(invitations).hasSize(1);
        assertThat(invitations.get(0).getUserId()).isEqualTo(ownerUser.getId());
        assertThat(invitations.get(0).getNickname()).isEqualTo("여행플래너");
        assertThat(invitations.get(0).getStatus()).isEqualTo(InvitationStatus.PENDING);
    }

    @Test
    @DisplayName("여행 계획의 편집자 목록 조회가 정상적으로 동작한다")
    void getEditors_Success() {
        // given
        // 편집자 추가 및 수락
        EditorAddResponse addResponse = editorService.addEditorToTravelPlan(
                travelPlan.getId(), editorUser.getId(), ownerUser.getId());
        editorService.acceptInvitation(addResponse.getEditorId(), editorUser.getId());

        // when
        List<EditorSearchResponse> editors = editorService.getEditors(travelPlan.getId());

        // then
        assertThat(editors).hasSize(1);
        assertThat(editors.get(0).getUserId()).isEqualTo(editorUser.getId());
        assertThat(editors.get(0).getNickname()).isEqualTo("친구");
        assertThat(editors.get(0).getStatus()).isEqualTo(InvitationStatus.ACCEPTED);
    }

    @Test
    @DisplayName("특정 상태의 편집자 목록 조회가 정상적으로 동작한다")
    void getEditorsByStatus_Success() {
        // given
        // 편집자 추가 (PENDING 상태)
        editorService.addEditorToTravelPlan(travelPlan.getId(), editorUser.getId(), ownerUser.getId());

        // when
        List<EditorSearchResponse> pendingEditors = editorService.getEditorsByStatus(
                travelPlan.getId(), "PENDING");

        // then
        assertThat(pendingEditors).hasSize(1);
        assertThat(pendingEditors.get(0).getUserId()).isEqualTo(editorUser.getId());
        assertThat(pendingEditors.get(0).getStatus()).isEqualTo(InvitationStatus.PENDING);
    }

    @Test
    @DisplayName("사용자별 초대 상태 조회가 정상적으로 동작한다")
    void getUserInvitations_Success() {
        // given
        // 초대 생성
        editorService.addEditorToTravelPlan(travelPlan.getId(), editorUser.getId(), ownerUser.getId());

        // when
        List<EditorSearchResponse> invitations = editorService.getUserInvitations(
                editorUser.getId(), "PENDING");

        // then
        assertThat(invitations).hasSize(1);
        assertThat(invitations.get(0).getUserId()).isEqualTo(ownerUser.getId());
        assertThat(invitations.get(0).getStatus()).isEqualTo(InvitationStatus.PENDING);
    }
}
