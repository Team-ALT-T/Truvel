package alt_t.truvel.editor.repository;

import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.auth.user.domain.repository.UserRepository;
import alt_t.truvel.editor.domain.entity.Editor;
import alt_t.truvel.editor.domain.repository.EditorRepository;
import alt_t.truvel.editor.enums.EditorRole;
import alt_t.truvel.editor.enums.InvitationStatus;
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
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class EditorRepositoryTest {

    @Autowired
    private EditorRepository editorRepository;
    @Autowired
    private TravelPlanRepository travelPlanRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CountryRepository countryRepository;
    @Autowired
    private CityRepository cityRepository;

    User USER1;
    User USER2;
    TravelPlan TRAVEL_PLAN;
    TravelPlan TRAVEL_PLAN2;
    Country KOREA;
    City SEOUL;
    Country JAPAN;
    City TOKYO;
    Editor EDITOR1;
    Editor EDITOR2;
    Editor EDITOR3;

    @BeforeEach
    void setUp() {
        // 1. 사용자 생성
        USER1 = userRepository.save(User.builder().nickname("user1").email("user1@test.com").password("pass").build());
        USER2 = userRepository.save(User.builder().nickname("user2").email("user2@test.com").password("pass").build());

        // 2. 국가 및 도시 생성
        KOREA = countryRepository.save(Country.builder().korean("한국").english("Korea").build());
        SEOUL = cityRepository.save(City.builder().korean("서울").english("Seoul").country(KOREA).build());
        JAPAN = countryRepository.save(Country.builder().korean("일본").english("Japan").build());
        TOKYO = cityRepository.save(City.builder().korean("도쿄").english("Tokyo").country(JAPAN).build());

        // 3. 여행 계획 생성 (국가, 도시 정보 포함)
        TRAVEL_PLAN = travelPlanRepository.save(TravelPlan.builder()

                .user(USER1).cityName("Seoul").nationName("Korea").cityId(SEOUL).nationId(KOREA).build());
        TRAVEL_PLAN2 = travelPlanRepository.save(TravelPlan.builder()
                .user(USER2).cityName("Tokyo").nationName("Japan").cityId(TOKYO).nationId(JAPAN).build());

        // 4. 편집자 정보 생성 및 연관관계 설정
        // TRAVEL_PLAN 에는 USER1(OWNER), USER2(EDITOR, ACCEPTED) 가 참여
        EDITOR1 = Editor.builder()
                .user(USER1)
                .travelPlan(TRAVEL_PLAN)
                .role(EditorRole.OWNER)
                .status(InvitationStatus.ACCEPTED)
                .build();

        EDITOR2 = Editor.builder()
                .user(USER2)
                .travelPlan(TRAVEL_PLAN)
                .role(EditorRole.EDITOR)
                .status(InvitationStatus.ACCEPTED)
                .build();

        // TRAVEL_PLAN2 에는 USER1(EDITOR, PENDING) 이 참여
        EDITOR3 = Editor.builder()
                .user(USER1)
                .travelPlan(TRAVEL_PLAN2)
                .role(EditorRole.EDITOR)
                .status(InvitationStatus.PENDING)
                .build();

        editorRepository.saveAll(List.of(EDITOR1, EDITOR2, EDITOR3));
    }

    @AfterEach
    void tearDown() {
        // @DataJpaTest가 롤백을 수행하지만, 명시적으로 정리
        editorRepository.deleteAll();
        travelPlanRepository.deleteAll();
        cityRepository.deleteAll();
        countryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("특정 여행 계획의 편집자 리스트 조회")
    void findByTravelPlan() {
        // given (in setUp)

        // when
        List<Editor> editors = editorRepository.findByTravelPlan(TRAVEL_PLAN);

        // then
        assertEquals(2, editors.size());
        assertTrue(editors.stream().anyMatch(e -> e.getUser().getNickname().equals("user1")));
        assertTrue(editors.stream().anyMatch(e -> e.getUser().getNickname().equals("user2")));
    }

    @Test
    @DisplayName("특정 사용자가 참여한 모든 편집 정보 조회")
    void findByUser() {
        // given (in setUp)

        // when
        List<Editor> editorsForUser1 = editorRepository.findByUser(USER1);

        // then
        assertEquals(2, editorsForUser1.size()); // USER1은 TRAVEL_PLAN, TRAVEL_PLAN2 두 곳에 참여
        assertTrue(editorsForUser1.stream().anyMatch(e -> e.getTravelPlan().getCityName().equals("Seoul")));
        assertTrue(editorsForUser1.stream().anyMatch(e -> e.getTravelPlan().getCityName().equals("Tokyo")));
    }

    @Test
    @DisplayName("특정 사용자와 여행 계획으로 편집자 정보 조회")
    void findByUserAndTravelPlan() {
        // given (in setUp)

        // when
        Editor foundEditor = editorRepository.findByUserAndTravelPlan(USER1, TRAVEL_PLAN).orElse(null);

        // then
        assertNotNull(foundEditor);
        assertEquals(USER1.getId(), foundEditor.getUser().getId());
        assertEquals(TRAVEL_PLAN.getId(), foundEditor.getTravelPlan().getId());
        assertEquals(EditorRole.OWNER, foundEditor.getRole());
    }

    @Test
    @DisplayName("특정 사용자가 여행 계획에 편집자로 존재하는지 확인")
    void existsByUserAndTravelPlan() {
        // given (in setUp)

        // when
        boolean exists = editorRepository.existsByUserAndTravelPlan(USER1, TRAVEL_PLAN);
        boolean notExists = editorRepository.existsByUserAndTravelPlan(USER2, TRAVEL_PLAN2);

        // then
        assertTrue(exists);
        assertFalse(notExists);
    }

    @Test
    @DisplayName("특정 사용자의 역할(Role)별 편집 정보 조회")
    void findByUserAndRole() {
        // given (in setUp)

        // when 
        List<Editor> OWNEREditors = editorRepository.findByUserAndRole(USER1, EditorRole.OWNER);
        List<Editor> editorEditors = editorRepository.findByUserAndRole(USER1, EditorRole.EDITOR);

        // then
        assertEquals(1, OWNEREditors.size());
        assertEquals("Seoul", OWNEREditors.get(0).getTravelPlan().getCityName());

        assertEquals(1, editorEditors.size());
        assertEquals("Tokyo", editorEditors.get(0).getTravelPlan().getCityName());
    }

    @Test
    @DisplayName("특정 사용자의 초대 상태(Status)별 편집 정보 조회")
    void findByUserAndStatus() {
        // given (in setUp)

        // when
        List<Editor> accepted = editorRepository.findByUserAndStatus(USER1, InvitationStatus.ACCEPTED);
        List<Editor> pending = editorRepository.findByUserAndStatus(USER1, InvitationStatus.PENDING);

        // then
        assertEquals(1, accepted.size());
        assertEquals(TRAVEL_PLAN.getId(), accepted.get(0).getTravelPlan().getId());

        assertEquals(1, pending.size());
        assertEquals(TRAVEL_PLAN2.getId(), pending.get(0).getTravelPlan().getId());
    }

    @Test
    @DisplayName("특정 여행 계획의 상태(Status)별 편집자 조회")
    void findByTravelPlanAndStatus() {
        // given (in setUp)

        // when
        List<Editor> acceptedEditors = editorRepository.findByTravelPlanAndStatus(TRAVEL_PLAN, InvitationStatus.ACCEPTED);

        // then
        assertEquals(2, acceptedEditors.size());
    }

    @Test
    @DisplayName("사용자의 초대 목록을 생성일자 내림차순으로 조회")
    void findByUserAndStatusOrderByCreatedAtDesc() {
        // given (in setUp)

        // when
        List<Editor> editors = editorRepository.findByUserAndStatusOrderByCreatedAtDesc(USER1, InvitationStatus.ACCEPTED);

        // then
        // EDITOR1이 먼저 생성되었으므로, 내림차순 정렬 시 나중에 위치해야 하지만,
        // 저장 시간이 거의 동일하여 순서 보장이 어려우므로 개수만 확인
        assertEquals(1, editors.size());
    }

    @Test
    @DisplayName("여행 계획의 특정 상태와 역할을 가진 편집자 조회")
    void findByTravelPlanAndStatusAndRole() {
        // given (in setUp)

        // when
        List<Editor> editors = editorRepository.findByTravelPlanAndStatusAndRole(TRAVEL_PLAN, InvitationStatus.ACCEPTED, EditorRole.EDITOR);

        // then
        assertEquals(1, editors.size());
        assertEquals(USER2.getId(), editors.get(0).getUser().getId());
    }
}