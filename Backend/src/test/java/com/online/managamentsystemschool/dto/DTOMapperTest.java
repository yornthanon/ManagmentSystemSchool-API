package com.online.managamentsystemschool.dto;

import com.online.managamentsystemschool.dto.request.CreateUserRequest;
import com.online.managamentsystemschool.dto.response.*;
import com.online.managamentsystemschool.entity.*;
import com.online.managamentsystemschool.entity.enums.AttendanceStatus;
import com.online.managamentsystemschool.entity.enums.Role;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DTOMapperTest {

    @Test
    void toUserDTO_shouldMapAllFields() {
        User user = new User();
        user.setId(1);
        user.setUsername("test");
        user.setFullName("Test User");
        user.setEmail("test@example.com");
        user.setRole(Role.ADMIN);

        UserDTO dto = DTOMapper.toUserDTO(user);

        assertEquals(1, dto.getId());
        assertEquals("test", dto.getUsername());
        assertEquals("Test User", dto.getFullName());
        assertEquals("test@example.com", dto.getEmail());
        assertEquals("ADMIN", dto.getRole());
    }

    @Test
    void toUserDTO_shouldReturnNullForNullInput() {
        assertNull(DTOMapper.toUserDTO(null));
    }

    @Test
    void toUser_shouldMapRequestToUser() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("newuser");
        request.setPassword("pass");
        request.setFullName("New User");
        request.setEmail("new@example.com");
        request.setRole("STUDENT");

        User user = DTOMapper.toUser(request);

        assertEquals("newuser", user.getUsername());
        assertEquals("pass", user.getPassword());
        assertEquals("New User", user.getFullName());
        assertEquals("new@example.com", user.getEmail());
        assertEquals(Role.STUDENT, user.getRole());
    }

    @Test
    void toStudentDTO_shouldMapWithUserFields() {
        User user = new User();
        user.setId(1);
        user.setUsername("student1");
        user.setFullName("Student One");
        user.setEmail("s1@example.com");

        Student student = new Student();
        student.setId(10);
        student.setUser(user);
        student.setGender("M");
        student.setDateOfBirth(LocalDate.of(2005, 1, 1));

        StudentDTO dto = DTOMapper.toStudentDTO(student);

        assertEquals(10, dto.getId());
        assertEquals(1, dto.getUserId());
        assertEquals("student1", dto.getUsername());
        assertEquals("Student One", dto.getFullName());
        assertEquals("M", dto.getGender());
        assertEquals(LocalDate.of(2005, 1, 1), dto.getDateOfBirth());
    }

    @Test
    void toStudentDTOList_shouldReturnEmptyForNull() {
        assertTrue(DTOMapper.toStudentDTOList(null).isEmpty());
    }

    @Test
    void toGradeDTO_shouldMapWithRelations() {
        Student student = new Student();
        student.setId(1);
        User user = new User();
        user.setFullName("Student Name");
        student.setUser(user);

        Subject subject = new Subject();
        subject.setId(10);
        subject.setName("Math");

        Classroom classroom = new Classroom();
        classroom.setId(20);
        classroom.setName("Class A");

        Grade grade = new Grade();
        grade.setId(100);
        grade.setStudent(student);
        grade.setSubject(subject);
        grade.setClassroom(classroom);
        grade.setScore(BigDecimal.valueOf(88.5));

        GradeDTO dto = DTOMapper.toGradeDTO(grade);

        assertEquals(100, dto.getId());
        assertEquals(1, dto.getStudentId());
        assertEquals("Student Name", dto.getStudentName());
        assertEquals(10, dto.getSubjectId());
        assertEquals("Math", dto.getSubjectName());
        assertEquals(20, dto.getClassroomId());
        assertEquals("Class A", dto.getClassroomName());
        assertEquals(BigDecimal.valueOf(88.5), dto.getScore());
    }

    @Test
    void toAttendanceDTO_shouldMapStatus() {
        Attendance attendance = new Attendance();
        attendance.setStatus(AttendanceStatus.PRESENT);

        AttendanceDTO dto = DTOMapper.toAttendanceDTO(attendance);

        assertEquals("PRESENT", dto.getStatus());
    }

    @Test
    void toAnnouncementDTO_shouldMapWithAuthor() {
        User author = new User();
        author.setId(1);
        author.setFullName("Author Name");

        Announcement announcement = new Announcement();
        announcement.setId(1);
        announcement.setTitle("Title");
        announcement.setContent("Content");
        announcement.setPublishedAt(LocalDateTime.of(2026, 1, 1, 10, 0));
        announcement.setAuthor(author);

        AnnouncementDTO dto = DTOMapper.toAnnouncementDTO(announcement);

        assertEquals(1, dto.getId());
        assertEquals("Title", dto.getTitle());
        assertEquals("Content", dto.getContent());
        assertEquals(1, dto.getAuthorId());
        assertEquals("Author Name", dto.getAuthorName());
    }
}
