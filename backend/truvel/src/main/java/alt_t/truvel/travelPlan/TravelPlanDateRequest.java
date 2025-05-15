package alt_t.truvel.travelPlan;

import lombok.Builder;
import lombok.Getter;
import org.jetbrains.annotations.NotNull;

import java.time.LocalDate;

@Getter
public class TravelPlanDateRequest {

    @NotNull
    private LocalDate start_date;

    @NotNull
    private LocalDate end_date;

    @Builder
    public TravelPlanDateRequest(LocalDate start_date, LocalDate end_date) {
        this.start_date = start_date;
        this.end_date = end_date;
    }
}
