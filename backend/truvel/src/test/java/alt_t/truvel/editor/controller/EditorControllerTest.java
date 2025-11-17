package alt_t.truvel.editor.controller;

import alt_t.truvel.auth.JwtAuthenticationFilter;
import alt_t.truvel.auth.jwt.JwtProvider;
import alt_t.truvel.editor.dto.EditorSearchResponse;
import alt_t.truvel.editor.enums.InvitationStatus;
import alt_t.truvel.editor.service.EditorService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;


import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = EditorController.class, excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
})
@AutoConfigureMockMvc(addFilters = false)
class EditorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EditorService editorService;

    @Test
    void searchUsers() throws Exception {
        // given
        EditorSearchResponse response = EditorSearchResponse.builder()
                .userId(1L)
                .nickname("testUser")
                .profileImg("profileImgUrl")
                .status(InvitationStatus.ACCEPTED)
                .email("test@example.com")
                .build();

        when(editorService.searchUsersByNickname(anyString())).thenReturn(response);

        // when & then
        mockMvc.perform(get("/editors/searchUser")
                        .param("nickname", "testUser"))
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
    void getTravelPlanEditors() {

    }

    @Test
    void inviteEditor() {
    }

    @Test
    void getUserTravelPlans() {
    }

    @Test
    void getUserInvitations() {
    }

    @Test
    void acceptInvitation() {
    }

    @Test
    void rejectInvitation() {
    }

    @Test
    void removeEditor() {
    }
}