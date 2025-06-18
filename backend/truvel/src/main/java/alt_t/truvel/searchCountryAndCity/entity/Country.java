package alt_t.truvel.searchCountryAndCity.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NoArgsConstructor; // 기본 생성자를 위해 추가

@Entity
@Getter
@NoArgsConstructor
public class Country {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String korean;

    @Column(nullable = false, length = 100)
    private String english;


    public Country(String korean, String english) {
        this.korean = korean;
        this.english = english;
    }
}