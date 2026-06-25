package com.jumps.moon.game;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class GameControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testStartReturns200WithSeedAndPlatforms() throws Exception {
        mockMvc.perform(post("/api/game/start"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seed").isNumber())
                .andExpect(jsonPath("$.platforms").isArray())
                .andExpect(jsonPath("$.platforms.length()").value(30));
    }

    @Test
    void testDeathReturns200WithNewGame() throws Exception {
        mockMvc.perform(post("/api/game/death"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seed").isNumber())
                .andExpect(jsonPath("$.platforms").isArray())
                .andExpect(jsonPath("$.platforms.length()").value(30));
    }

    @Test
    void testWinReturns200WithOkTrue() throws Exception {
        WinRecord record = new WinRecord("Alice", 1500, 2, System.currentTimeMillis());
        mockMvc.perform(post("/api/game/win")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(record)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    void testHighscoresReturns200WithList() throws Exception {
        // Post a win record first so the list is non-empty
        WinRecord record = new WinRecord("Bob", 2000, 1, System.currentTimeMillis());
        mockMvc.perform(post("/api/game/win")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(record)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/game/highscores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
