package alt_t.truvel.auth.user.domain.repository;

import alt_t.truvel.auth.user.domain.entity.User;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 회원가입/로그인 시 이메일 중복 체크 혹은 조회용 메서드
     * @param email : 사용자가 입력한 이메일 -> 비교할 이메일
     * @return : 해당 이메일을 사용하는 사용자의 정보
     */
    Optional<User> findByEmail(String email);

    /**
     * 닉네임으로 사용자 검색 (대소문자 구분 없이 부분 일치)
     * @param nickname : 검색할 닉네임
     * @return : 검색된 사용자 목록
     */
    Optional<User> findByNicknameContainingIgnoreCase(String nickname);

    Optional<User> findByNickname(@NotBlank(message = "이름을 입력해주세요.") String nickname);
}
