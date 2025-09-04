package alt_t.truvel.searchCountryAndCity.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Entity
@Getter
@NoArgsConstructor
public class City {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String korean;

    @Column(nullable = false, length = 100)
    private String english;

    @ManyToOne
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    /**
     * City 엔티티 생성자
     * @param korean : 도시 한국어명
     * @param english : 도시 영어명
     * @param country : 해당 도시가 속한 국가
     */
    public City(String korean, String english, Country country) {
        this.korean = korean;
        this.english = english;
        this.country = country;
    }
}