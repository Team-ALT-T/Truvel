package alt_t.truvel.editor.domain.entity;

import alt_t.truvel.auth.user.domain.entity.User;
import alt_t.truvel.editor.enums.EditorRole;
import alt_t.truvel.editor.enums.InvitationStatus;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "editor", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "travel_plan_id"}))
public class Editor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_plan_id", nullable = false)
    private TravelPlan travelPlan;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EditorRole role = EditorRole.EDITOR; // Editor 역할 -> 일행초대 페이지에서 EDITOR 역할의 사용자만 목록에 불러오도록 사용

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InvitationStatus status = InvitationStatus.PENDING; // 초대수락 여부

    // 연관관계 편의 메서드
    public void setUser(User user) {
        this.user = user;
    }

    public void setTravelPlan(TravelPlan travelPlan) {
        this.travelPlan = travelPlan;
    }

    // 초대 상태 관련 메서드

    // 초대를 수락하는 메서드
    public void acceptInvitation() {
        this.status = InvitationStatus.ACCEPTED;
    }


    // 초대를 거절하는 메서드
    public void rejectInvitation() {
        this.status = InvitationStatus.REJECTED;
    }


    // 초대가 보류 상태인지 확인하는 메서드
    public boolean isPending() {
        return this.status == InvitationStatus.PENDING;
    }


    // 초대를 허락했는지 확인하는 메서드
    public boolean isAccepted() {
        return this.status == InvitationStatus.ACCEPTED;
    }


    // 초대를 거절했는지 확인하는 메서드
    public boolean isRejected() {
        return this.status == InvitationStatus.REJECTED;
    }
}