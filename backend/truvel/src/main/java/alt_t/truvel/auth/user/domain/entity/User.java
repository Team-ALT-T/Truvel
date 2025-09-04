package alt_t.truvel.auth.user.domain.entity;

import alt_t.truvel.auth.emailVerification.domain.entity.EmailVerification;
import alt_t.truvel.editor.domain.entity.Editor;
import alt_t.truvel.travelPlan.domain.entity.TravelPlan;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;


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

    @Column(unique = true)
    private String email;

    @Column
    private String password;

    @Column(unique = true)
    private String nickname;

    @Column
    private String profileImg;

    @Column(nullable = false)
    @Builder.Default
    private Boolean locationConsent = false;

//    @Column(nullable = true)
//    private boolean over14; // 만 14세 이상인가?

    @Column(nullable = true)
    @Builder.Default
    private Boolean agreeTerms = false; // 서비스 이용약관 동의

    @Column(nullable = true)
    @Builder.Default
    private Boolean agreePrivacy = false; // 개인정보 수집 및 이용 동의


    @Column(nullable = false)
    @Builder.Default
    private Boolean agreeThirdParty = false; // 제3자 개인정보 제공 동의

    @Column(nullable = false)
    @Builder.Default
    private Boolean emailVerified = false; // 이메일 인증 여부, 기본값으로 false 설정

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmailVerification> emailVerifications = new ArrayList<>();


    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TravelPlan> travelPlans = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Editor> editors = new ArrayList<>();

    public void setTravelPlan(TravelPlan travelPlan) {
    }

    public void addTravelPlan(TravelPlan travelPlan) {
        this.travelPlans.add(travelPlan);
        travelPlan.setUser(this);
    }

    public void addEmailVerification(EmailVerification emailVerification) {
        this.emailVerifications.add(emailVerification);
        emailVerification.setUser(this);
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public void addEditor(Editor editor) {
        this.editors.add(editor);
        editor.setUser(this);
    }



}
