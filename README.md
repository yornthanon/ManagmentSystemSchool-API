# School Management System

A role-based school management system with a Spring Boot backend and React frontend.

## Structure

```
School-ManagementSystem/
├── backend/              # Spring Boot (Java 21) - admin scope
└── frontend/             # React + TypeScript + Vite - admin scope
```

## Backend

- **Java 21**, Spring Boot 3.4.1, Gradle
- Spring Security + JWT (stateless)
- Spring Data JPA + H2 (dev) / PostgreSQL (local)
- Flyway migration (`db/migration/V1__init.sql`)
- SpringDoc OpenAPI (Swagger UI)
- Admin seeding on startup (`admin` / `admin123`)

### Run

```bash
cd backend
./gradlew bootRun
```

Backend runs on `http://localhost:8080`.  
Swagger UI: `http://localhost:8080/swagger-ui.html`

## Frontend

- React 19, TypeScript, Vite, Tailwind CSS
- Admin-only pages (teacher/student not yet implemented)

### Run

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

## Admin Scope

Implemented modules:
- `user/` — User management (ADMIN only)
- `subject/` — Subjects CRUD
- `classroom/` — Classrooms CRUD
- `enrollment/` — Enrollments CRUD
- `dashboard/` — Admin stats
- `auth/` — Login + JWT
- `attendance/` — placeholder
- `grade/` — placeholder

Teacher and student modules are not yet implemented.
