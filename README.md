# School-ManagementSystem

Modular monolith Spring Boot (Java 21 + Gradle + PostgreSQL + Flyway) backend and React + Vite + TypeScript frontend for `ADMIN`, `TEACHER`, and `STUDENT` roles.

## Environment Variables

Backend (`backend/src/main/resources/application.yml`):
- `DB_URL` (default `jdbc:postgresql://localhost:5432/school_management`)
- `DB_USERNAME` (default `postgres`)
- `DB_PASSWORD`
- `JWT_SECRET` (required, minimum 32 characters)
- `JWT_EXPIRATION_MS` (default `86400000`)
- `ADMIN_EMAIL` (required on first run to seed the initial `ADMIN` account)
- `ADMIN_PASSWORD` (required on first run to seed the initial `ADMIN` account)
- `CORS_ALLOWED_ORIGINS` (default `http://localhost:5173,http://localhost:3000`)

Frontend (`frontend/.env`):
- `VITE_API_BASE_URL=http://localhost:8080`

## Run Locally

### Backend
```bash
cd backend
export DB_URL=jdbc:postgresql://localhost:5432/school_management
export DB_USERNAME=postgres
export DB_PASSWORD=your_postgres_password
export JWT_SECRET=replace-with-at-least-32-char-random-secret
export ADMIN_EMAIL=your_admin_email
export ADMIN_PASSWORD=your_admin_password
gradle bootRun
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
