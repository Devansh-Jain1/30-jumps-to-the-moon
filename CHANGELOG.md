# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
