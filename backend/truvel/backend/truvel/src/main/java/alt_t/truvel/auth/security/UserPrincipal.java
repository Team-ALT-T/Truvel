package alt_t.truvel.auth.security;

import lombok.Builder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

// UserDetails : 스프링 시큐리티가 정의한 사용자 정보의 뼈대/규약
// UserDetails는 구현체가 필요하다.
public class UserPrincipal implements UserDetails {

    // 인증된 사용자의 정보중 다루고 싶은 정보
    private Long id; // 사용자의 아이디
    private String email; // 사용자의 이메일
    private String nickname; // 사용자 이름
    private String password; // 암호화된 사용자 패스워드
    private Collection<? extends GrantedAuthority> authorities; // 사용자의 권한

    // 생성자
    @Builder
    public UserPrincipal(Long id, String username, String password, String email,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.nickname = username;
        this.password = password;
        this.authorities = authorities;
    }

    // UserDetail에서 추가된 정보
    public Long getId() {
        return id;
    }

    public String getEmail() {return email;}


    // UserDetails의 메서드

    // 권한 가져오기 -> User에 authorities 필드 추가 후 이용 가능
    // 현재 서비스에 admin은 고려하지 않았기에 패스함
    // admin은 사용자 관리, 콘텐츠 관리, 모니터링 등 필요할수도 있음.
    // ? extends GrantedAuthority : GrantedAuthority를 상속받은 모든 타입
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    // 암호화된 패스워드 가져오기 -> User에서 password 이용
    @Override
    public String getPassword() {
        return password;
    }

    // 사용X
    @Override
    public String getUsername() {
        return "";
    }

    // 사용자 이름 가져오기 -> User에서 username 이용
//    @Override
    public String getNickname() {
        return nickname;
    }

    // 계정 만료 여부 -> User에 expirationDate를 추가 후 사용 가능
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // 계정 잠금 여부 -> User에 locked, failedLoginAttempts 필드 추가후 사용 가능
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    // 비밀번호 만료 여부 -> User에 passwordLastChangedDate 추가 후 사용 가능
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // 사용자 활성화 여부 -> User에 enabled 필드 추가 후 사용 가능
    @Override
    public boolean isEnabled() {
        return true;
    }
}