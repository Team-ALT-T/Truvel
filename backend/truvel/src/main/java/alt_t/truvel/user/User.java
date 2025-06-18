package alt_t.truvel.user;

import alt_t.truvel.travelPlan.TravelPlan;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * TravelPlan에 연관관계를 맺기 위한 임시용 엔티티입니다!!
 * 추후에 User엔티티가 완성되었을때 제거해주세요!!
 */
@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "truvel_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String email;

    @Column
    private String password;

    @Column
    private String nickname;

    @Column
    private String profileImg;

    @Column
    private byte locationConsent;

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TravelPlan> travelPlans = new ArrayList<>();

    public void setTravelPlan(TravelPlan travelPlan) {
    }

    public void addTravelPlan(TravelPlan travelPlan) {
        this.travelPlans.add(travelPlan);
        travelPlan.setUser(this);
    }



}
