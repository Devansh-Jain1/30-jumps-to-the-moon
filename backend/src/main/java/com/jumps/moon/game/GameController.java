package com.jumps.moon.game;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "http://localhost:3000")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/start")
    public GameStateResponse start() {
        return gameService.newGame();
    }

    @PostMapping("/death")
    public GameStateResponse death() {
        return gameService.newGame();
    }

    @PostMapping("/win")
    public Map<String, Object> win(@RequestBody WinRecord record) {
        gameService.saveWin(record);
        return Map.of("ok", true);
    }

    @GetMapping("/highscores")
    public List<WinRecord> highscores() {
        return gameService.getTopTen();
    }
}
