package alt_t.truvel.travelPlan;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
// 여행 기본 정보 입력 - 여행지 입력의 요청 DTO
public class TravelPlanDraftRequest {
    @NotBlank
    private String nation;

    @NotBlank
    private String city;

    @Builder
    public TravelPlanDraftRequest(String nation, String city) {
        this.city = city;
        this.nation = nation;
    }


    public TravelPlan toTravelPlanDraft() {
        return new TravelPlan(null, nation, null, null, city);
    }
}
