package alt_t.truvel.editor.domain.repository;

import alt_t.truvel.editor.domain.entity.Editor;
import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.editor.enums.EditorRole;
import alt_t.truvel.editor.enums.InvitationStatus;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EditorRepository extends JpaRepository<Editor, Long> {

    // 여행 계획의 모든 편집자를 조회하는 메서드
    List<Editor> findByTravelPlan(TravelPlan travelPlan);

    // 사용자가 편집자로 참여한 모든 여행 계획을 조회하는 메서드
    List<Editor> findByUser(User user);

    // 특정 사용자가 특정 여행 계획의 편집자인지 확인
    Optional<Editor> findByUserAndTravelPlan(User user, TravelPlan travelPlan);

    // 중복 추가 방지를 위한 존재 여부 확인 메서드
    boolean existsByUserAndTravelPlan(User user, TravelPlan travelPlan);

    // 특정 여행 계획의 편집자 수 조회
//    @Query("SELECT COUNT(e) FROM Editor e WHERE e.travelPlan = :travelPlan")
//    long countByTravelPlan(@Param("travelPlan") TravelPlan travelPlan);

    // 특정 사용자의 역할별 편집자 권한을 조회하는 메서드
    List<Editor> findByUserAndRole(User user, EditorRole role);

    // 사용자별로 초대 상태를 조회하는 메서드
    List<Editor> findByUserAndStatus(User user, InvitationStatus status);
    
    // 여행 계획에서 편집자의 초대 상태를 조회하는 메서드
    List<Editor> findByTravelPlanAndStatus(TravelPlan travelPlan, InvitationStatus status);

    // 여행 계획에서 사용자의 초대 수락여부를 생성일자 순서로 목록을 조회하는 메서드
    List<Editor> findByUserAndStatusOrderByCreatedAtDesc(User user, InvitationStatus status);

    // 여행 계획의 수락된 편집자만 조회
    List<Editor> findByTravelPlanAndStatusAndRole(TravelPlan travelPlan, InvitationStatus status, EditorRole role);
}