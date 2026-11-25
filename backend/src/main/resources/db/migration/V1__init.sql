CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE students (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name         VARCHAR(150) NOT NULL,
    dob          DATE,
    parent_phone VARCHAR(30),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE teachers (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(150) NOT NULL,
    phone      VARCHAR(30),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE classes (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_classes_name_year UNIQUE (name, academic_year)
);

CREATE TABLE subjects (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE class_subjects (
    id         BIGSERIAL PRIMARY KEY,
    class_id   BIGINT      NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id BIGINT      NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    teacher_id BIGINT      NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_class_subject UNIQUE (class_id, subject_id)
);

CREATE TABLE enrollments (
    id         BIGSERIAL PRIMARY KEY,
    student_id BIGINT      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id   BIGINT      NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_enrollment_student_class UNIQUE (student_id, class_id)
);

CREATE TABLE attendance (
    id            BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT      NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    date          DATE        NOT NULL,
    status        VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_attendance_enrollment_date UNIQUE (enrollment_id, date)
);

CREATE TABLE grades (
    id               BIGSERIAL PRIMARY KEY,
    enrollment_id    BIGINT        NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    class_subject_id BIGINT        NOT NULL REFERENCES class_subjects(id) ON DELETE CASCADE,
    exam_type        VARCHAR(60)   NOT NULL,
    score            NUMERIC(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_class_subjects_teacher_id ON class_subjects(teacher_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX idx_attendance_enrollment_id ON attendance(enrollment_id);
CREATE INDEX idx_grades_enrollment_id ON grades(enrollment_id);
CREATE INDEX idx_grades_class_subject_id ON grades(class_subject_id);
