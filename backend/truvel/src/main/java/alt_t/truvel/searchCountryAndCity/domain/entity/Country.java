package alt_t.truvel.searchCountryAndCity.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor; // 기본 생성자를 위해 추가

@Entity
@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Country {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String korean;

    @Column(length = 100)
    private String english;

    @Column(nullable = false)
    @Builder.Default
    private Long popularity = 0L;

    public Country(String korean, String english) {
        this.korean = korean;
        this.english = english;
        this.popularity = 0L;
    }

    public void incrementPopularity(Long count) {
        this.popularity += count;
    }
}