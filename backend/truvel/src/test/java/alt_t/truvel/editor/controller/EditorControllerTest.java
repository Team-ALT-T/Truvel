package alt_t.truvel.editor.controller;

import alt_t.truvel.auth.jwt.JwtProvider;
import alt_t.truvel.auth.security.UserPrincipal;
import alt_t.truvel.editor.dto.EditorSearchResponse;
import alt_t.truvel.editor.service.EditorService;
import alt_t.truvel.travelPlan.dto.TravelPlanResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;

@WebMvcTest(EditorController.class)
class EditorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EditorService editorService;

    @MockitoBean
    private JwtProvider jwtTokenProvider;

    @MockitoBean
    private RedisTemplate<String, String> redisTemplate;


    @Test
    @DisplayName("사용자 검색 API 테스트")
    void searchUsers() throws Exception {
        // given
        EditorSearchResponse response = EditorSearchResponse.builder()
                .userId(1L)
                .nickname("testUser")
                .profileImg("profileImgUrl")
                .status(alt_t.truvel.editor.enums.InvitationStatus.ACCEPTED)
                .email("test@example.com")
                .build();

        when(editorService.searchUsersByNickname(anyString())).thenReturn(response);

        // when & then
        mockMvc.perform(get("/editors/searchUser")
                        .param("nickname", "testUser")
                        .with(authentication(createTestAuthentication(1L))))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> {
                    String jsonResponse = result.getResponse().getContentAsString();
                    EditorSearchResponse actualResponse = objectMapper.readValue(jsonResponse, EditorSearchResponse.class);

                    assertEquals(response.getUserId(), actualResponse.getUserId());
                    assertEquals(response.getNickname(), actualResponse.getNickname());
                    assertEquals(response.getProfileImg(), actualResponse.getProfileImg());
                    assertEquals(response.getStatus(), actualResponse.getStatus());
                    assertEquals(response.getEmail(), actualResponse.getEmail());
                });
    }

    @Test
    @DisplayName("여행 계획 편집자 조회 API 테스트")
    void getTravelPlanEditors() throws Exception {
        // given
        Long travelPlanId = 1L;
        EditorSearchResponse editor = EditorSearchResponse.builder()
                .userId(2L)
                .nickname("editorA")
                .profileImg("img")
                .status(alt_t.truvel.editor.enums.InvitationStatus.ACCEPTED)
                .email("a@a.com")
                .build();
        when(editorService.getEditors(travelPlanId)).thenReturn(List.of(editor));

        // when & then
        mockMvc.perform(get("/travels/{travelPlanId}/editors", travelPlanId)
                        .with(authentication(createTestAuthentication(1L))))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> {
                    String jsonResponse = result.getResponse().getContentAsString();
                    List<EditorSearchResponse> actual = objectMapper.readValue(jsonResponse, new TypeReference<List<EditorSearchResponse>>() {});
                    assertEquals(1, actual.size());
                    assertEquals(editor.getUserId(), actual.get(0).getUserId());
                });
    }

    @Test
    @DisplayName("여행 계획 편집자 초대 API 테스트")
    void inviteEditor() throws Exception {
        // given
        Long travelPlanId = 1L;
        Long currentUserId = 1L;
        Long editorUserId = 2L;
        Map<String, Object> requestBody = Map.of("editorUserId", 2L);

        // when & then
        mockMvc.perform(post("/travels/{travelPlanId}/editors", travelPlanId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody))
                        .with(authentication(createTestAuthentication(currentUserId)))
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(editorService).addEditorToTravelPlan(travelPlanId, editorUserId, currentUserId);
    }

    @Test
    @DisplayName("사용자의 여행 계획 조회 API 테스트")
    void getUserTravelPlans() throws Exception {
        // given
        Long userId = 1L;
        when(editorService.getTravelPlansByUserId(userId)).thenReturn(Collections.emptyList());

        // when & then
        mockMvc.perform(get("/editors/{userId}/travels", userId)
                        .with(authentication(createTestAuthentication(userId))))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> {
                    String jsonResponse = result.getResponse().getContentAsString();
                    List<TravelPlanResponse> actual = objectMapper.readValue(jsonResponse, new TypeReference<List<TravelPlanResponse>>() {});
                    assertEquals(0, actual.size());
                });
    }

    @Test
    @DisplayName("사용자의 초대 목록 조회 API 테스트")
    void getUserInvitations() throws Exception {
        // given
        Long userId = 1L;
        EditorSearchResponse invitation = EditorSearchResponse.builder()
                .userId(3L)
                .nickname("invitee")
                .profileImg("img")
                .status(alt_t.truvel.editor.enums.InvitationStatus.PENDING)
                .email("invite@e.com")
                .build();
        when(editorService.getUserInvitations(userId, "PENDING")).thenReturn(List.of(invitation));

        // when & then
        mockMvc.perform(get("/users/{userId}/invitations", userId)
                        .param("status", "PENDING")
                        .with(authentication(createTestAuthentication(userId))))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> {
                    String jsonResponse = result.getResponse().getContentAsString();
                    List<EditorSearchResponse> actual = objectMapper.readValue(jsonResponse, new TypeReference<List<EditorSearchResponse>>() {});
                    assertEquals(1, actual.size());
                    assertEquals(invitation.getUserId(), actual.get(0).getUserId());
                });
    }

    @Test
    @DisplayName("초대 수락 API 테스트")
    void acceptInvitation() throws Exception {
        // given
        Long editorId = 10L;
        Long userId = 2L;

        // when & then
        mockMvc.perform(put("/editors/{editorId}/accept", editorId)
                        .with(authentication(createTestAuthentication(userId)))
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(editorService).acceptInvitation(editorId, userId);
    }

    @Test
    @DisplayName("초대 거절 API 테스트")
    void rejectInvitation() throws Exception {
        // given
        Long editorId = 11L;
        Long userId = 3L;

        // when & then
        mockMvc.perform(put("/editors/{editorId}/reject", editorId)
                        .with(authentication(createTestAuthentication(userId)))
                        .with(csrf()))
                .andExpect(status().isOk());

        // 3. 컨트롤러가 올바른 userId로 서비스를 호출했는지 검증합니다.
        verify(editorService).rejectInvitation(editorId, userId);
    }

    @Test

    @DisplayName("편집자 삭제 API 테스트")
    void removeEditor() throws Exception {
        // given
        Long editorId = 5L;
        Long userId = 1L; // 삭제를 요청하는 사용자 ID

        // when & then
        mockMvc.perform(delete("/editors/{editorId}", editorId)
                        .with(authentication(createTestAuthentication(userId)))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("편집자 삭제가 완료되었습니다."));

        verify(editorService).removeEditor(editorId);
    }

    /**
     * 테스트용 Authentication 객체를 생성하는 헬퍼 메소드
     * @param userId 생성할 사용자의 ID
     * @return 생성된 Authentication 객체
     */
    private Authentication createTestAuthentication(Long userId) {
        UserPrincipal principal = UserPrincipal.builder().id(userId).build();
        return new UsernamePasswordAuthenticationToken(principal, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }
}