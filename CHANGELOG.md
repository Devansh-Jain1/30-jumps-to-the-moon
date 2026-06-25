# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
