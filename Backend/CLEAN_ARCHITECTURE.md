# Clean Architecture - School Management System

## Table of Contents

- [1. Clean Architecture ជាអ្វី?](#1-clean-architecture-ជាអ្វី)
- [2. គោលការណ៍សំខាន់](#2-គោលការណ៍សំខាន់)
- [3. រចនាសម្ព័ន្ធ Layer ទាំង 4](#3-រចនាសម្ព័ន្ធ-layer-ទាំង-4)
- [4. របៀបប្រើប្រាស់ Project](#4-របៀបប្រើប្រាស់-project)
- [5. ទំនាក់ទំនងរវាង File](#5-ទំនាក់ទំនងរវាង-file)
- [6. Domain Layer](#6-domain-layer)
- [7. Application Layer](#7-application-layer)
- [8. Infrastructure Layer](#8-infrastructure-layer)
- [9. Presentation Layer](#9-presentation-layer)
- [10. ដំណើរការ Data Flow](#10-ដំណើរការ-data-flow)
- [11. File ទាំងអស់](#11-file-ទាំងអស់)
- [12. បញ្ហាដែលជួបនិងដំណោះស្រាយ](#12-បញ្ហាដែលជួបនិងដំណោះស្រាយ)

---

## 1. Clean Architecture ជាអ្វី?

Clean Architecture គឺជា **គំរូស្ថាបត្យកម្មកូដ** (Software Architecture Pattern) ដែលបង្កើតដោយ **Robert C. Martin (Uncle Bob)**។

គោលបំណងរបស់វាគឺ៖
- **បែងចែកកូដ** ជា Layer ច្បាស់លាស់
- **ឯករណ្តរគ្នា** (Independence) - Domain Layer មិនអាស្រ័យលើ Framework ឬ Library ខាងក្រៅទេ
- **ងាយស្រួលផ្លាស់ប្តូរ** - អាចប្តូរ Database ឬ Framework បានដោយមិនប៉ះពាល់ Business Logic

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   Presentation Layer (ខាងក្រៅបំផុត)                │
│   Controllers, DTOs, API                             │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│   Application Layer (Use Cases)                      │
│   Services, Ports (Interfaces)                       │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│   Domain Layer (ខាងក្នុងបំផុត)                       │
│   Entities, Enums, Exceptions                        │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│   Infrastructure Layer (ខាងក្រៅ)                     │
│   Database, Security, Config, Mappers                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Rule សំខាន់បំផុត - Dependency Rule:**

```
Presentation  →  imports  →  Application  →  imports  →  Domain
Infrastructure →  imports  →  Domain + Application Port
```

Dependencies ត្រូវ **ចេញពីខាងក្រៅ** ទៅ **ខាងក្នុង**។ **មិនអនុញ្ញាត** ឲ្យ Domain ឬ Application ដឹងពី Infrastructure ទេ។

---

## 2. គោលការណ៍សំខាន់

### 2.1 Domain ជាកម្មសិទ្ធិ (Domain Owns Everything)

Domain Layer គឺ **ឯករណ្តរគ្នា**។ វាមិន import JPA, Spring, ឬ Framework ណាមួយទេ។

```java
// Domain Entity - គ្មាន @Entity, @Table, @Column
public class User {
    private Integer id;
    private String username;
    private String email;
    private Role role;    // Domain Enum
}
```

### 2.2 Port/Adapter Pattern

- **Port** = Interface នៅក្នុង Application Layer (កំណត់ថាអាចធ្វើអ្វីបាន)
- **Adapter** = Implementation នៅក្នុង Infrastructure Layer (ធ្វើជាក់ស្តែង)

```java
// Port (Interface) - នៅ Application Layer
public interface UserRepository {
    Optional<User> findById(Integer id);
    User save(User user);
}

// Adapter (Implementation) - នៅ Infrastructure Layer
@Repository
public class UserRepositoryImpl implements UserRepository {
    private final UserJpaRepository jpaRepository;
    // ... implementation
}
```

### 2.3 បំបែក Object 3 ប្រភេទ

| Object Type | ទីតាំង | គោលបំណង |
|-------------|---------|----------|
| **Domain Model** | `domain/model/` | Business Rules សុទ្ធ |
| **JPA Entity** | `infrastructure/persistence/entity/` | Database Mapping |
| **DTO** | `presentation/dto/` | API Request/Response |

---

## 3. រចនាសម្ព័ន្ធ Layer ទាំង 4

### Layer ទី 1: Domain (ខាងក្នុងបំផុត)

> **គោលបំណង:** កំណត់ **Business Rules** របស់ app
>
> **ឯករណ្តរគ្នា** ពី Framework, Database, ឬ Library ខាងក្រៅ

```
domain/
├── model/          ← 11 Domain Entities (Plain Java)
├── enums/          ← Role, AttendanceStatus
└── exception/      ← DomainException, UserNotFoundException
```

### Layer ទី 2: Application (Use Cases)

> **គោលបំណង:** **Business Logic** - គ្រប់គ្រងការហៅរវាង Domain និង Port

```
application/
├── port/           ← 11 Repository Interfaces
└── service/        ← 11 Service Classes
```

### Layer ទី 3: Infrastructure (ខាងក្រៅ)

> **គោលបំណង:** **Implementation** ជាក់ស្តែង - Database, Security, Config

```
infrastructure/
├── persistence/
│   ├── entity/     ← 11 JPA Entities
│   ├── repository/ ← 11 JPA Repos + 11 Implementations (22 files)
│   └── mapper/     ← 11 Domain <-> JPA Mappers
├── security/       ← JWT, Spring Security
├── config/         ← OpenAPI, DataInit
└── GlobalExceptionHandler.java
```

### Layer ទី 4: Presentation (ខាងក្រៅបំផុត)

> **គោលបំណង:** **API Interface** - ទទួល HTTP Request និង Return Response

```
presentation/
├── controller/     ← 12 REST Controllers
└── dto/
    ├── request/    ← 10 Request DTOs
    ├── response/   ← 12 Response DTOs
    └── DTOMapper.java
```

---

## 4. របៀបប្រើប្រាស់ Project

### Build

```bash
./gradlew compileJava --no-daemon
```

### Run Tests

```bash
./gradlew test --no-daemon
```

### Start App

```bash
./gradlew bootRun --no-daemon
```

### API Docs (Swagger)

```
http://localhost:8080/swagger-ui/index.html
```

---

## 5. ទំនាក់ទំនងរវាង File

### 5.1 ទំនាក់ទំនង Import

```
Client (HTTP Request)
  │
  ▼
AuthController (Presentation)
  │ import → UserService (Application)
  │ import → DTOMapper (Presentation)
  │
  ▼
UserService (Application)
  │ import → UserRepository (Port)
  │ import → User (Domain)
  │
  ▼
UserRepositoryImpl (Infrastructure)
  │ implements → UserRepository (Port)
  │ import → UserMapper (Infrastructure)
  │ import → UserJpaRepository (Infrastructure)
  │
  ▼
UserJpaRepository (Infrastructure)
  │ extends → Spring Data JPA
  │ import → UserEntity (Infrastructure)
  │
  ▼
PostgreSQL Database
```

### 5.2 ច្បាប់ Import

```
✅ Presentation  →  imports  →  Application (Service)
✅ Presentation  →  imports  →  Presentation (DTO)
✅ Application   →  imports  →  Domain (Model, Enum, Exception)
✅ Application   →  imports  →  Application (Port Interface)
✅ Infrastructure →  imports  →  Domain (Model)
✅ Infrastructure →  imports  →  Application (Port)
✅ Infrastructure →  imports  →  Infrastructure (JPA, Mapper)

❌ Domain        →  imports  →  ❌ អ្វីទាំងអស់ (ឯករណ្តរគ្នា)
❌ Application   →  imports  →  ❌ Infrastructure
❌ Application   →  imports  →  ❌ Presentation
```

---

## 6. Domain Layer

### 6.1 Domain Enums

| File | ព័ត៌មាន | មុខងារ |
|------|---------|---------|
| `domain/enums/Role.java` | `ADMIN, STUDENT, TEACHER, PARENT` | កំណត់ Role របស់ User |
| `domain/enums/AttendanceStatus.java` | `PRESENT, ABSENT, LATE` | កំណត់ Status វត្តមាន |

**Role.java** មាន methods:
- `getValue()` - ត្រឡប់ value ជា lowercase (ឧ. "admin")
- `fromString(String)` - បំប្លែង String ទៅ Enum

### 6.2 Domain Entities

| File | Fields សំខាន់ | មុខងារ |
|------|----------------|---------|
| `User.java` | id, username, email, password, role | គ្រប់គ្រង User |
| `Student.java` | id, userId, firstName, lastName, dob, gender | គ្រប់គ្រង Student |
| `Teacher.java` | id, userId, firstName, lastName, specialization | គ្រប់គ្រង Teacher |
| `Parent.java` | id, userId, firstName, lastName, phone | គ្រប់គ្រង Parent |
| `Classroom.java` | id, name, gradeLevel, section | គ្រប់គ្រង Classroom |
| `Subject.java` | id, name, code, description | គ្រប់គ្រង Subject |
| `Grade.java` | id, studentId, subjectId, score, semester, year | គ្រប់គ្រង Grade |
| `Attendance.java` | id, studentId, classroomId, date, status | គ្រប់គ្រងវត្តមាន |
| `Announcement.java` | id, title, content, authorId, date | គ្រប់គ្រង Announcement |
| `ClassroomSubject.java` | id, classroomId, subjectId, teacherId | ភ្ជាប់ Classroom និង Subject |
| `StudentClass.java` | id, studentId, classroomId, enrollDate | ភ្ជាប់ Student និង Classroom |

**ចំណុចសំខាន់:** Domain Entities ប្រើ **flat fields** ឧ. `student.getUserId()` មិនមែន `student.getUser().getId()` ទេ។

### 6.3 Domain Exceptions

| File | មុខងារ |
|------|---------|
| `DomainException.java` | Exception មូលដ្ឋានសម្រាប់ Business Logic Errors |
| `UserNotFoundException.java` | ពេលរក User មិនឃើញ |

---

## 7. Application Layer

### 7.1 Repository Ports (Interfaces)

Port គឺជា **Interface** ដែលកំណត់ថាតើ Data អាចធ្វើអ្វីបាន។

| Port | Methods សំខាន់ |
|------|-----------------|
| `UserRepository` | findById, save, delete, findByUsername, findAll |
| `StudentRepository` | findById, save, delete, findByUserId, findAll |
| `TeacherRepository` | findById, save, delete, findByUserId, findAll |
| `ParentRepository` | findById, save, delete, findByUserId, findAll |
| `ClassroomRepository` | findById, save, delete, findAll |
| `SubjectRepository` | findById, save, delete, findAll |
| `GradeRepository` | findById, save, delete, findByStudentId, findBySubjectId |
| `AttendanceRepository` | findById, save, delete, findByStudentIdAndDate |
| `AnnouncementRepository` | findById, save, delete, findByAuthorId |
| `ClassroomSubjectRepository` | findById, save, delete, findByClassroomId |
| `StudentClassRepository` | findById, save, delete, findByStudentId, findByClassroomId |

**ឧទារណកម្ម:**

```java
public interface UserRepository {
    Optional<User> findById(Integer id);
    Optional<User> findByUsername(String username);
    List<User> findAll();
    User save(User user);
    void deleteById(Integer id);
}
```

### 7.2 Application Services

Service គឺជា **Business Logic** ដែលប្រើ Port ដើម្បីចូលដំណើរការ Data។

| Service | ទទួលខុសត្រូវ | ប្រើ Ports |
|---------|---------------|-----------|
| `UserService` | គ្រប់គ្រង User CRUD | UserRepository |
| `StudentService` | គ្រប់គ្រង Student CRUD | StudentRepository, UserRepository |
| `TeacherService` | គ្រប់គ្រង Teacher CRUD | TeacherRepository, UserRepository |
| `ParentService` | គ្រប់គ្រង Parent CRUD | ParentRepository, UserRepository |
| `ClassroomService` | គ្រប់គ្រង Classroom CRUD | ClassroomRepository |
| `SubjectService` | គ្រប់គ្រង Subject CRUD | SubjectRepository |
| `GradeService` | គ្រប់គ្រង Grade CRUD | GradeRepository, StudentRepository, SubjectRepository |
| `AttendanceService` | គ្រប់គ្រងវត្តមាន | AttendanceRepository, StudentRepository, ClassroomRepository |
| `AnnouncementService` | គ្រប់គ្រង Announcement | AnnouncementRepository, UserRepository |
| `ClassroomSubjectService` | ភ្ជាប់ Classroom-Subject | ClassroomSubjectRepository |
| `StudentClassService` | ភ្ជាប់ Student-Classroom | StudentClassRepository |

**ឧទារណកម្ម:**

```java
@Service
public class UserService {
    private final UserRepository userRepository; // Port Interface

    public User createUser(User user) {
        // Business Logic
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        return userRepository.save(user);
    }
}
```

**ចំណុចសំខាន់:** Service ប្រើ **Port Interface** មិនមែន JPA Repository ផ្ទាល់ទេ!

---

## 8. Infrastructure Layer

### 8.1 JPA Entities

JPA Entity គឺជា **Object** ដែល Map ទៅ **Database Table**។

| File | Table Name | Entity Fields |
|------|-----------|---------------|
| `UserEntity.java` | `users` | id, username, email, password, role |
| `StudentEntity.java` | `students` | id, user_id, first_name, last_name, date_of_birth, gender |
| `TeacherEntity.java` | `teachers` | id, user_id, first_name, last_name, specialization |
| `ParentEntity.java` | `parents` | id, user_id, first_name, last_name, phone |
| `ClassroomEntity.java` | `classrooms` | id, name, grade_level, section |
| `SubjectEntity.java` | `subjects` | id, name, code, description |
| `GradeEntity.java` | `grades` | id, student_id, subject_id, score, semester, year |
| `AttendanceEntity.java` | `attendances` | id, student_id, classroom_id, date, status |
| `AnnouncementEntity.java` | `announcements` | id, title, content, author_id, date |
| `ClassroomSubjectEntity.java` | `classroom_subjects` | id, classroom_id, subject_id, teacher_id |
| `StudentClassEntity.java` | `student_classes` | id, student_id, classroom_id, enroll_date |

**ឧទារណកម្ម:**

```java
@Entity
@Table(name = "users")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;
}
```

### 8.2 Domain <-> JPA Mappers

Mapper គឺជា **Utility Class** ដែលបំប្លែងរវាង **Domain Model** និង **JPA Entity**។

| File | Methods | មុខងារ |
|------|---------|---------|
| `UserMapper.java` | `toDomain()`, `toEntity()` | User <-> UserEntity |
| `StudentMapper.java` | `toDomain()`, `toEntity()` | Student <-> StudentEntity |
| `TeacherMapper.java` | `toDomain()`, `toEntity()` | Teacher <-> TeacherEntity |
| `ParentMapper.java` | `toDomain()`, `toEntity()` | Parent <-> ParentEntity |
| `ClassroomMapper.java` | `toDomain()`, `toEntity()` | Classroom <-> ClassroomEntity |
| `SubjectMapper.java` | `toDomain()`, `toEntity()` | Subject <-> SubjectEntity |
| `GradeMapper.java` | `toDomain()`, `toEntity()` | Grade <-> GradeEntity |
| `AttendanceMapper.java` | `toDomain()`, `toEntity()` | Attendance <-> AttendanceEntity |
| `AnnouncementMapper.java` | `toDomain()`, `toEntity()` | Announcement <-> AnnouncementEntity |
| `ClassroomSubjectMapper.java` | `toDomain()`, `toEntity()` | ClassroomSubject <-> ClassroomSubjectEntity |
| `StudentClassMapper.java` | `toDomain()`, `toEntity()` | StudentClass <-> StudentClassEntity |

**ឧទារណកម្ម:**

```java
public class UserMapper {

    // JPA Entity → Domain Model
    public static User toDomain(UserEntity entity) {
        if (entity == null) return null;
        return new User(
            entity.getId(),
            entity.getUsername(),
            entity.getEmail(),
            entity.getPassword(),
            entity.getRole()
        );
    }

    // Domain Model → JPA Entity
    public static UserEntity toEntity(User domain) {
        if (domain == null) return null;
        UserEntity entity = new UserEntity();
        entity.setId(domain.getId());
        entity.setUsername(domain.getUsername());
        entity.setEmail(domain.getEmail());
        entity.setPassword(domain.getPassword());
        entity.setRole(domain.getRole());
        return entity;
    }
}
```

### 8.3 JPA Repositories (Spring Data)

JPA Repository គឺជា **Interface** ដែល Spring Data JPA ប្រើដើម្បី Query Database។

| File | Extends | Methods |
|------|---------|---------|
| `UserJpaRepository` | `JpaRepository<UserEntity, Integer>` | findById, save, delete, findByUsername |
| `StudentJpaRepository` | `JpaRepository<StudentEntity, Integer>` | findById, save, delete, findByUserId |
| ... | ... | ... |

### 8.4 Repository Implementations

Implementation គឺជា Class ដែល **បំពេញ Port Interface** ដោយប្រើ JPA Repository និង Mapper។

| File | Implements | ប្រើ |
|------|-----------|------|
| `UserRepositoryImpl` | `UserRepository` | UserJpaRepository, UserMapper |
| `StudentRepositoryImpl` | `StudentRepository` | StudentJpaRepository, StudentMapper |
| ... | ... | ... |

**ឧទារណកម្ម:**

```java
@Repository
public class UserRepositoryImpl implements UserRepository {
    private final UserJpaRepository jpaRepository;

    public UserRepositoryImpl(UserJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<User> findById(Integer id) {
        // JPA → Mapper → Domain
        return jpaRepository.findById(id).map(UserMapper::toDomain);
    }

    @Override
    public User save(User user) {
        // Domain → Mapper → JPA → Save
        UserEntity entity = UserMapper.toEntity(user);
        UserEntity saved = jpaRepository.save(entity);
        return UserMapper.toDomain(saved);
    }
}
```

### 8.5 Security

| File | មុខងារ | ពេលប្រើ |
|------|---------|----------|
| `SecurityConfig.java` | Configure Spring Security | App ចាប់ផ្តើម |
| `JwtTokenProvider.java` | បង្កើត/Validate JWT Token | Login, API Request |
| `JWTAuthFilter.java` | ពិនិត្យ Token នៅពេល Request | គ្រប់ API Request |
| `CustomUserDetailsService.java` | Load User ពី Database | Login |

**ដំណើរការ Login:**

```
1. Client ផ្ញើ POST /auth/login (email + password)
2. AuthController → UserService → UserRepository → DB
3. CustomUserDetailsService → UserRepository → DB
4. SecurityConfig → authenticate
5. JwtTokenProvider → createToken
6. Return JWT Token ទៅ Client
```

### 8.6 Config

| File | មុខងារ | ពេលប្រើ |
|------|---------|----------|
| `OpenApiConfig.java` | Swagger/OpenAPI Config | ពេលចង់មើល API Docs |
| `DataInitialize.java` | បង្កើត Admin User | App ចាប់ផ្តើម |

### 8.7 GlobalExceptionHandler

| File | មុខងារ |
|------|---------|
| `GlobalExceptionHandler.java` | គ្រប់គ្រង Exception ទាំងអស់ → Return Error Response |

| Exception | HTTP Status | Message |
|-----------|-------------|---------|
| `MethodArgumentNotValidException` | 400 | Validation failed |
| `AuthenticationException` | 401 | Authentication failed |
| `BadCredentialsException` | 401 | Invalid credentials |
| `AccessDeniedException` | 403 | Access denied |
| `NoHandlerFoundException` | 404 | Endpoint not found |
| `EntityNotFoundException` | 404 | Resource not found |
| `IllegalArgumentException` | 400 | Invalid argument |
| `RuntimeException` | 500 | Internal server error |
| `Exception` | 500 | Internal server error |

---

## 9. Presentation Layer

### 9.1 REST Controllers

| Controller | Endpoint | Methods |
|-----------|----------|---------|
| `AuthController` | `/auth` | POST /login, POST /register |
| `UserController` | `/api/users` | GET, POST, PUT, DELETE |
| `StudentController` | `/api/students` | GET, POST, PUT, DELETE |
| `TeacherController` | `/api/teachers` | GET, POST, PUT, DELETE |
| `ParentController` | `/api/parents` | GET, POST, PUT, DELETE |
| `ClassroomController` | `/api/classrooms` | GET, POST, PUT, DELETE |
| `SubjectController` | `/api/subjects` | GET, POST, PUT, DELETE |
| `GradeController` | `/api/grades` | GET, POST, PUT, DELETE |
| `AttendanceController` | `/api/attendances` | GET, POST |
| `AnnouncementController` | `/api/announcements` | GET, POST |
| `ClassroomSubjectController` | `/api/classroom-subjects` | GET, POST, DELETE |
| `StudentClassController` | `/api/student-classes` | GET, POST, DELETE |

**ឧទារណកម្ម:**

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Integer id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(DTOMapper.toUserDTO(user));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody @Valid CreateUserRequest request) {
        User user = DTOMapper.toUser(request);
        User created = userService.createUser(user);
        return ResponseEntity.ok(DTOMapper.toUserDTO(created));
    }
}
```

### 9.2 Request DTOs

| DTO | Fields |
|-----|--------|
| `LoginRequest` | email, password |
| `CreateUserRequest` | username, email, password, role |
| `UpdateUserRequest` | username, email, password, role |
| `CreateStudentRequest` | userId, firstName, lastName, dateOfBirth, gender |
| `CreateTeacherRequest` | userId, firstName, lastName, specialization |
| `CreateParentRequest` | userId, firstName, lastName, phone |
| `CreateClassroomRequest` | name, gradeLevel, section |
| `CreateSubjectRequest` | name, code, description |
| `CreateGradeRequest` | studentId, subjectId, score, semester, year |
| `CreateAttendanceRequest` | studentId, classroomId, date, status |

### 9.3 Response DTOs

| DTO | Fields |
|-----|--------|
| `LoginResponse` | token, tokenType, user (UserDTO) |
| `UserDTO` | id, username, email, role |
| `StudentDTO` | id, userId, firstName, lastName, dateOfBirth, gender |
| `TeacherDTO` | id, userId, firstName, lastName, specialization |
| `ParentDTO` | id, userId, firstName, lastName, phone |
| `ClassroomDTO` | id, name, gradeLevel, section |
| `SubjectDTO` | id, name, code, description |
| `GradeDTO` | id, studentId, subjectId, score, semester, year |
| `AttendanceDTO` | id, studentId, classroomId, date, status |
| `AnnouncementDTO` | id, title, content, authorId, date |
| `ClassroomSubjectDTO` | id, classroomId, subjectId, teacherId |
| `StudentClassDTO` | id, studentId, classroomId, enrollDate |

### 9.4 DTOMapper

DTOMapper គឺជា **Utility Class** ដែលបំប្លែងរវាង **Domain Model** និង **DTO**។

```java
public class DTOMapper {

    // Request DTO → Domain Model
    public static User toUser(CreateUserRequest request) {
        return new User(null, request.getUsername(),
            request.getEmail(), request.getPassword(), request.getRole());
    }

    // Domain Model → Response DTO
    public static UserDTO toUserDTO(User user) {
        return new UserDTO(user.getId(), user.getUsername(),
            user.getEmail(), user.getRole().getValue());
    }
}
```

**ចំណុចសំខាន់:** DTOMapper ប្រើ **flat fields** របស់ Domain Model ឧ. `student.getUserId()` មិនមែន `student.getUser().getId()` ទេ។

---

## 10. ដំណើរការ Data Flow

### 10.1 GET /api/students/1 (សុំ Student)

```
1. Client ផ្ញើ GET /api/students/1
         │
2. StudentController ទទួល Request
         │
3. StudentController ហៅ studentService.getStudentById(1)
         │
4. StudentService ហៅ studentRepository.findById(1) (Port)
         │
5. StudentRepositoryImpl (Implementation) ហៅ studentJpaRepository.findById(1)
         │
6. StudentJpaRepository សួរ PostgreSQL: SELECT * FROM students WHERE id=1
         │
7. PostgreSQL ត្រឡប់ StudentEntity row
         │
8. StudentMapper.toDomain(entity) បំប្លែງ StudentEntity → Student (Domain)
         │
9. StudentService ត្រឡប់ Student (Domain)
         │
10. StudentController ហៅ DTOMapper.toStudentDTO(student) បំប្លែង Domain → DTO
         │
11. StudentController ត្រឡប់ ResponseEntity<StudentDTO> ទៅ Client
```

### 10.2 POST /auth/login (Login)

```
1. Client ផ្ញើ POST /auth/login {email, password}
         │
2. AuthController ទទួល Request
         │
3. AuthController ហៅ authenticationManager.authenticate()
         │
4. CustomUserDetailsService ហៅ userRepository.findByEmail(email) (Port)
         │
5. UserRepositoryImpl ហៅ userJpaRepository.findByEmail(email)
         │
6. PostgreSQL ត្រឡប់ UserEntity
         │
7. UserMapper.toDomain() បំប្លែງ Entity → Domain
         │
8. SecurityConfig ពិនិត្យ password
         │
9. JwtTokenProvider.createToken(user) បង្កើត JWT Token
         │
10. AuthController ត្រឡប់ LoginResponse {token, user} ទៅ Client
```

### 10.3 POST /api/students (បង្កើត Student)

```
1. Client ផ្ញើ POST /api/students {userId, firstName, lastName, ...}
         │
2. StudentController ទទួល @Valid CreateStudentRequest
         │
3. DTOMapper.toStudent(request) បំប្លែງ DTO → Domain Model
         │
4. StudentController ហៅ studentService.createStudent(student)
         │
5. StudentService ពិនិត្យ Business Logic
         │  - ពិនិត្យ User មានឬអត់
         │  - ពិនិត្យ Student មានឬអត់
         │
6. studentRepository.save(student) (Port)
         │
7. StudentRepositoryImpl:
         │  - StudentMapper.toEntity(student) → StudentEntity
         │  - studentJpaRepository.save(entity) → DB
         │  - StudentMapper.toDomain(saved) → Student
         │
8. StudentController ហៅ DTOMapper.toStudentDTO(student)
         │
9. Return ResponseEntity<StudentDTO> ទៅ Client
```

---

## 11. File ទាំងអស់

### 11.1 Domain (15 files)

```
src/main/java/com/online/managamentsystemschool/domain/
├── enums/
│   ├── AttendanceStatus.java          ← PRESENT, ABSENT, LATE
│   └── Role.java                      ← ADMIN, STUDENT, TEACHER, PARENT
├── exception/
│   ├── DomainException.java           ← Business Logic Exception
│   └── UserNotFoundException.java     ← User Not Found
└── model/
    ├── Announcement.java              ← id, title, content, authorId, date
    ├── Attendance.java                ← id, studentId, classroomId, date, status
    ├── Classroom.java                 ← id, name, gradeLevel, section
    ├── ClassroomSubject.java          ← id, classroomId, subjectId, teacherId
    ├── Grade.java                     ← id, studentId, subjectId, score, semester, year
    ├── Parent.java                    ← id, userId, firstName, lastName, phone
    ├── Student.java                   ← id, userId, firstName, lastName, dob, gender
    ├── StudentClass.java              ← id, studentId, classroomId, enrollDate
    ├── Subject.java                   ← id, name, code, description
    ├── Teacher.java                   ← id, userId, firstName, lastName, specialization
    └── User.java                      ← id, username, email, password, role
```

### 11.2 Application (22 files)

```
src/main/java/com/online/managamentsystemschool/application/
├── port/
│   ├── AnnouncementRepository.java    ← Interface: findById, save, delete, findByAuthorId
│   ├── AttendanceRepository.java      ← Interface: findById, save, delete, findByStudentIdAndDate
│   ├── ClassroomRepository.java       ← Interface: findById, save, delete, findAll
│   ├── ClassroomSubjectRepository.java ← Interface: findById, save, delete, findByClassroomId
│   ├── GradeRepository.java           ← Interface: findById, save, delete, findByStudentId
│   ├── ParentRepository.java          ← Interface: findById, save, delete, findByUserId
│   ├── StudentClassRepository.java    ← Interface: findById, save, delete, findByStudentId
│   ├── StudentRepository.java         ← Interface: findById, save, delete, findByUserId
│   ├── SubjectRepository.java         ← Interface: findById, save, delete, findAll
│   ├── TeacherRepository.java         ← Interface: findById, save, delete, findByUserId
│   └── UserRepository.java            ← Interface: findById, save, delete, findByUsername
└── service/
    ├── AnnouncementService.java       ← Business Logic: createAnnouncement, getAnnouncementsByAuthor
    ├── AttendanceService.java         ← Business Logic: markAttendance, getStudentAttendanceByDate
    ├── ClassroomService.java          ← Business Logic: createClassroom, getAllClassrooms
    ├── ClassroomSubjectService.java   ← Business Logic: assignTeacherToSubject, removeTeacher
    ├── GradeService.java              ← Business Logic: addGrade, getStudentGrades, getSubjectAverageGrade
    ├── ParentService.java             ← Business Logic: createParent, getParentById
    ├── StudentClassService.java       ← Business Logic: enrollStudent, getStudentClassroom
    ├── StudentService.java            ← Business Logic: createStudent, getStudentById
    ├── SubjectService.java            ← Business Logic: createSubject, getAllSubjects
    ├── TeacherService.java            ← Business Logic: createTeacher, getTeacherById
    └── UserService.java               ← Business Logic: createUser, getUserById, getUserByUsername
```

### 11.3 Infrastructure (37 files)

```
src/main/java/com/online/managamentsystemschool/infrastructure/
├── GlobalExceptionHandler.java        ← គ្រប់គ្រង Exception ទាំងអស់
├── config/
│   ├── DataInitialize.java            ← បង្កើត Admin User ពេល App ចាប់ផ្តើម
│   └── OpenApiConfig.java             ← Swagger/OpenAPI Config
├── security/
│   ├── CustomUserDetailsService.java  ← Load User ពី Database
│   ├── JWTAuthFilter.java             ← ពិនិត្យ Token នៅពេល Request
│   ├── JwtTokenProvider.java          ← បង្កើត/Validate JWT Token
│   └── SecurityConfig.java           ← Configure Spring Security
└── persistence/
    ├── entity/
    │   ├── AnnouncementEntity.java    ← @Entity @Table("announcements")
    │   ├── AttendanceEntity.java      ← @Entity @Table("attendances")
    │   ├── ClassroomEntity.java       ← @Entity @Table("classrooms")
    │   ├── ClassroomSubjectEntity.java ← @Entity @Table("classroom_subjects")
    │   ├── GradeEntity.java           ← @Entity @Table("grades")
    │   ├── ParentEntity.java          ← @Entity @Table("parents")
    │   ├── StudentClassEntity.java    ← @Entity @Table("student_classes")
    │   ├── StudentEntity.java         ← @Entity @Table("students")
    │   ├── SubjectEntity.java         ← @Entity @Table("subjects")
    │   ├── TeacherEntity.java         ← @Entity @Table("teachers")
    │   └── UserEntity.java            ← @Entity @Table("users")
    ├── mapper/
    │   ├── AnnouncementMapper.java    ← toDomain(), toEntity()
    │   ├── AttendanceMapper.java      ← toDomain(), toEntity()
    │   ├── ClassroomMapper.java       ← toDomain(), toEntity()
    │   ├── ClassroomSubjectMapper.java ← toDomain(), toEntity()
    │   ├── GradeMapper.java           ← toDomain(), toEntity()
    │   ├── ParentMapper.java          ← toDomain(), toEntity()
    │   ├── StudentClassMapper.java    ← toDomain(), toEntity()
    │   ├── StudentMapper.java         ← toDomain(), toEntity()
    │   ├── SubjectMapper.java         ← toDomain(), toEntity()
    │   ├── TeacherMapper.java         ← toDomain(), toEntity()
    │   └── UserMapper.java            ← toDomain(), toEntity()
    └── repository/
        ├── AnnouncementJpaRepository.java   ← extends JpaRepository
        ├── AnnouncementRepositoryImpl.java  ← implements AnnouncementRepository
        ├── AttendanceJpaRepository.java     ← extends JpaRepository
        ├── AttendanceRepositoryImpl.java    ← implements AttendanceRepository
        ├── ClassroomJpaRepository.java      ← extends JpaRepository
        ├── ClassroomRepositoryImpl.java     ← implements ClassroomRepository
        ├── ClassroomSubjectJpaRepository.java ← extends JpaRepository
        ├── ClassroomSubjectRepositoryImpl.java ← implements ClassroomSubjectRepository
        ├── GradeJpaRepository.java          ← extends JpaRepository
        ├── GradeRepositoryImpl.java         ← implements GradeRepository
        ├── ParentJpaRepository.java         ← extends JpaRepository
        ├── ParentRepositoryImpl.java        ← implements ParentRepository
        ├── StudentClassJpaRepository.java   ← extends JpaRepository
        ├── StudentClassRepositoryImpl.java  ← implements StudentClassRepository
        ├── StudentJpaRepository.java        ← extends JpaRepository
        ├── StudentRepositoryImpl.java       ← implements StudentRepository
        ├── SubjectJpaRepository.java        ← extends JpaRepository
        ├── SubjectRepositoryImpl.java       ← implements SubjectRepository
        ├── TeacherJpaRepository.java        ← extends JpaRepository
        ├── TeacherRepositoryImpl.java       ← implements TeacherRepository
        ├── UserJpaRepository.java           ← extends JpaRepository
        └── UserRepositoryImpl.java          ← implements UserRepository
```

### 11.4 Presentation (25 files)

```
src/main/java/com/online/managamentsystemschool/presentation/
├── controller/
│   ├── AnnouncementController.java    ← /api/announcements
│   ├── AttendanceController.java      ← /api/attendances
│   ├── AuthController.java            ← /auth
│   ├── ClassroomController.java       ← /api/classrooms
│   ├── ClassroomSubjectController.java ← /api/classroom-subjects
│   ├── GradeController.java           ← /api/grades
│   ├── ParentController.java          ← /api/parents
│   ├── StudentClassController.java    ← /api/student-classes
│   ├── StudentController.java         ← /api/students
│   ├── SubjectController.java         ← /api/subjects
│   ├── TeacherController.java         ← /api/teachers
│   └── UserController.java            ← /api/users
└── dto/
    ├── DTOMapper.java                 ← Domain <-> DTO Mapper
    ├── request/
    │   ├── CreateAttendanceRequest.java
    │   ├── CreateClassroomRequest.java
    │   ├── CreateGradeRequest.java
    │   ├── CreateParentRequest.java
    │   ├── CreateStudentRequest.java
    │   ├── CreateSubjectRequest.java
    │   ├── CreateTeacherRequest.java
    │   ├── CreateUserRequest.java
    │   ├── LoginRequest.java
    │   └── UpdateUserRequest.java
    └── response/
        ├── AnnouncementDTO.java
        ├── AttendanceDTO.java
        ├── ClassroomDTO.java
        ├── ClassroomSubjectDTO.java
        ├── GradeDTO.java
        ├── LoginResponse.java
        ├── ParentDTO.java
        ├── StudentClassDTO.java
        ├── StudentDTO.java
        ├── SubjectDTO.java
        ├── TeacherDTO.java
        └── UserDTO.java
```

### 11.5 Test (2 files)

```
src/test/java/com/online/managamentsystemschool/
├── ManagamentSystemSchoolApplicationTests.java  ← Context Load Test
└── domain/enums/
    └── RoleTest.java                            ← Role Enum Unit Test
```

---

## 12. បញ្ហាដែលជួបនិងដំណោះស្រាយ

### 12.1 Domain Entity vs JPA Entity

**បញ្ហា:** Domain Model និង JPA Entity មាន Fields ដូចគ្នា តែ Object ខុសគ្នា។

**ដំណោះស្រាយ:** ប្រើ **Mapper** ដើម្បីបំប្លែងរវាងពួកវា។

```java
// Domain Model - គ្មាន JPA
public class Student {
    private Integer id;
    private Integer userId;  // flat field
}

// JPA Entity - មាន @Entity
@Entity
public class StudentEntity {
    @Id
    private Integer id;
    private Integer userId;  // foreign key
}

// Mapper - បំប្លែង
public class StudentMapper {
    public static Student toDomain(StudentEntity entity) { ... }
    public static StudentEntity toEntity(Student domain) { ... }
}
```

### 12.2 Service ប្រើ Port មិនមែន JPA

**បញ្ហា:** Service មិនគួរដឹងពី JPA ឬ Database។

**ដំណោះស្រាយ:** Service ប្រើ **Port Interface** មិនមែន JPA Repository ផ្ទាល់ទេ។

```java
// ❌ ខុស - Service ប្រើ JPA ផ្ទាល់
@Service
public class StudentService {
    private final StudentJpaRepository jpaRepository;
}

// ✅ ត្រឹម - Service ប្រើ Port Interface
@Service
public class StudentService {
    private final StudentRepository studentRepository; // Port
}
```

### 12.3 Flat Fields vs Nested Objects

**បញ្ហា:** Domain Model ប្រើ flat fields (ឧ. `student.getUserId()`) មិនមែន nested objects (ឧ. `student.getUser().getId()`) ទេ។

**ដំណោះស្រាយ:** DTOMapper និង Mappers ត្រូវប្រើ flat fields។

```java
// ❌ ខុស - nested object
public static StudentDTO toStudentDTO(Student student) {
    return new StudentDTO(student.getUser().getId()); // User មិនមានក្នុង Domain!
}

// ✅ ត្រឹម - flat field
public static StudentDTO toStudentDTO(Student student) {
    return new StudentDTO(student.getUserId()); // flat field
}
```

### 12.4 Test Import ខុស Package

**បញ្ហា:** Test file import ពី package ចាស់ (ឧ. `entity.enums.Role`)។

**ដំណោះស្រាយ:** ផ្ទេរ Test file ទៅ package ថ្មី (ឧ. `domain.enums.RoleTest`)។

---

## Summary

| Layer | Package | File Count | គោលបំណង |
|-------|---------|-----------|----------|
| **Domain** | `domain/` | 15 | Business Rules |
| **Application** | `application/` | 22 | Use Cases + Ports |
| **Infrastructure** | `infrastructure/` | 37 | Implementation |
| **Presentation** | `presentation/` | 25 | API Interface |
| **Root** | (root) | 1 | Main Class |
| **Test** | `src/test/` | 2 | Unit Tests |
| **Total** | | **102** | |
