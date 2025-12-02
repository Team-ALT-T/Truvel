package alt_t.truvel.travelPlan.controller;

import alt_t.truvel.auth.jwt.JwtProvider;
import alt_t.truvel.auth.security.UserPrincipal;
import alt_t.truvel.travelPlan.dto.TravelPlanRequest;
import alt_t.truvel.travelPlan.dto.TravelPlanResponse;
import alt_t.truvel.travelPlan.service.TravelPlanService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TravelPlanController.class)
class TravelPlanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TravelPlanService travelPlanService;

    @MockitoBean
    private JwtProvider jwtProvider;

    @MockitoBean
    private RedisTemplate<String, String> redisTemplate;

    @Test
    @DisplayName("여행 계획 생성 API 테스트")
    void createTravelPlan() throws Exception {
        // given
        Long userId = 1L;
        TravelPlanRequest request = new TravelPlanRequest(1L, LocalDate.now(), LocalDate.now().plusDays(3));
        TravelPlanResponse response = TravelPlanResponse.builder().travelPlanId(10L).countryName("한국").cityName("서울").build();

        when(travelPlanService.createTravelPlan(anyLong(),any(TravelPlanRequest.class))).thenReturn(response);

        // when & then
        mockMvc.perform(post("/travels")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(authentication(createTestAuthentication(userId)))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.travelPlanId").value(10L))
                .andExpect(jsonPath("$.countryName").value("한국"))
                .andExpect(jsonPath("$.cityName").value("서울"));
    }

    @Test
    @DisplayName("사용자의 모든 여행 계획 조회 API 테스트")
    void getTravelPlans() throws Exception {
        // given
        Long userId = 1L;
        TravelPlanResponse response = TravelPlanResponse.builder().travelPlanId(10L).countryName("한국").cityName("서울").build();
        when(travelPlanService.getTravelPlans(userId)).thenReturn(List.of(response));

        // when & then
        mockMvc.perform(get("/travels")
                        .with(authentication(createTestAuthentication(userId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].travelPlanId").value(10L))
                .andExpect(jsonPath("$[0].countryName").value("한국"));
    }

    @Test
    @DisplayName("특정 여행 계획 상세 조회 API 테스트")
    void getTravelPlan() throws Exception {
        // given
        Long travelPlanId = 10L;
        TravelPlanResponse response = TravelPlanResponse.builder().travelPlanId(travelPlanId).countryName("일본").cityName("도쿄").build();
        when(travelPlanService.getTravelPlan(travelPlanId)).thenReturn(response);

        // when & then
        mockMvc.perform(get("/travels/{travelPlanId}", travelPlanId)
                        .with(authentication(createTestAuthentication(1L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.travelPlanId").value(10L))
                .andExpect(jsonPath("$.countryName").value("일본"))
                .andExpect(jsonPath("$.cityName").value("도쿄"));
    }

    private Authentication createTestAuthentication(Long userId) {
        UserPrincipal principal = UserPrincipal.builder().id(userId).build();
        return new UsernamePasswordAuthenticationToken(principal, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }
}