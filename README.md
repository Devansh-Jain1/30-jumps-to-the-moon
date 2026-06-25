# 30 Jumps to the Moon

A full-stack web application with a React frontend and Spring Boot backend.

## Project Structure

```
30-jumps-to-the-moon/
├── frontend/   # Vite + React app (port 3000)
├── backend/    # Spring Boot Maven app (port 8080)
└── README.md
```

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at http://localhost:3000

## Running the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Or, if you have Maven installed:

```bash
cd backend
mvn spring-boot:run
```

The backend runs at http://localhost:8080

## Running Frontend Tests

```bash
cd frontend
npm test
```

## Running Backend Tests

```bash
cd backend
./mvnw test
```

## Tech Stack

- **Frontend**: Vite 8, React 19, Vitest
- **Backend**: Spring Boot 3.2, Java 17, Maven
