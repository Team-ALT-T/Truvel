package alt_t.truvel.editor.repository;

import alt_t.truvel.editor.domain.entity.Editor;
import alt_t.truvel.editor.domain.repository.EditorRepository;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import alt_t.truvel.travelPlan.domain.repository.TravelPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class EditorRepositoryTest {

    @Autowired
    private EditorRepository editorRepository;
    @Autowired
    private TravelPlanRepository travelPlanRepository;

    TravelPlan TRAVEL_PLAN;
    Editor EDITOR1;
    Editor EDITOR2;
    @BeforeEach
    void setUp() {
        EDITOR1 = Editor.builder()
                .build();
        editorRepository.save(EDITOR1);
        EDITOR2 = Editor.builder()
                .build();
        editorRepository.save(EDITOR2);
        TRAVEL_PLAN = TravelPlan.builder()
                .id(1L)
                .editors(List.of(EDITOR1, EDITOR2))
                .build();
        travelPlanRepository.save(TRAVEL_PLAN);
    }

    @Test
    @DisplayName("특정 여행 계획의 편집자 리스트 조회")
    void findByTravelPlan() {
        // given in setUp()
        // when
        List<Editor> editors = editorRepository.findByTravelPlan(TRAVEL_PLAN);
        // then
        assertEquals(1L,editors.getFirst().getId());
        assertEquals(2L,editors.get(1).getId());

    }

    @Test
    void findByUser() {
    }

    @Test
    void findByUserAndTravelPlan() {
    }

    @Test
    void existsByUserAndTravelPlan() {
    }

    @Test
    void findByUserAndRole() {
    }

    @Test
    void findByUserAndStatus() {
    }

    @Test
    void findByTravelPlanAndStatus() {
    }

    @Test
    void findByUserAndStatusOrderByCreatedAtDesc() {
    }

    @Test
    void findByTravelPlanAndStatusAndRole() {
    }
}