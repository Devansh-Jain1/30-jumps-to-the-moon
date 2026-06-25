# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.3.0] - 2026-06-25

### Added
- REST API endpoints (issue #3)
- `WinRecord` record: playerName, score, deathCount, timestamp
- `GameStateResponse` record: seed + platform list
- `GameService`: newGame(), saveWin(), getTopTen() (top 10 sorted by deathCount asc then score desc)
- `GameController`: POST /api/game/start, POST /api/game/death, POST /api/game/win, GET /api/game/highscores
- MockMvc tests for all 4 endpoints

## [v0.2.0] - 2026-06-25

### Added
- Platform generation (issue #2)
- `Platform` record: index, x, y, width, stage
- `PlatformGenerator` service: deterministic generation of 30 platforms from a seed
- Stage assignment: platforms 1-10 = stage 1, 11-20 = stage 2, 21-30 = stage 3
- Y strictly ascending at 18px increments from 550.0; horizontal gaps constrained to ≤200px
- 4 unit tests: count, stage assignment, seed determinism, ascending Y

## [v0.8.0] - 2026-06-25

### Added
- Game state machine: MENU, PLAYING, WON states (issue #5)
- `MenuScreen.jsx`: title, subtitle, and Start Game button; dark space theme
- `GameOverScreen.jsx`: "Respawning…" overlay shown for 1 second after platform-5+ death
- `WonScreen.jsx`: score/deaths/session-high summary + top-10 leaderboard table + Play Again button
- `GameCanvas.jsx`: canvas renderer using `renderer.js`, `useScoreState` hook, platform collision, death/win callbacks
- `App.jsx`: full state-machine orchestration (start, quit, die-early, die-late, win, play-again)
- `api/gameApi.js`: all fetch calls centralised (startGame, reportDeath, reportWin, getHighscores)
- `renderer.js`: pure canvas drawing helpers (drawBackground, drawPlatform, drawPlayer, drawHUD)
- `state/gameState.js`: enum + reducer for state transitions
- `state/scoreState.js`: useScoreState hook (score, deaths, sessionHighScore)
- 38 unit tests across all new modules; 89% line coverage

## [v0.1.0] - 2026-06-25

### Added
- Project monorepo scaffold (issue #1)
- `/frontend`: Vite + React app configured on port 3000
- `/backend`: Spring Boot 3.2 Maven project configured on port 8080
- Root `README.md` with exact run commands for both services
- `.gitignore` covering `node_modules/`, `target/`, `.env`
- `CHANGELOG.md` (this file)
- Frontend unit tests (Vitest + React Testing Library)
- Backend context-load test (Spring Boot Test)
