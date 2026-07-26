package com.online.managamentsystemschool.presentation.dto;

import com.online.managamentsystemschool.presentation.dto.request.CreateUserRequest;
import com.online.managamentsystemschool.presentation.dto.response.*;
import com.online.managamentsystemschool.domain.model.*;
import com.online.managamentsystemschool.domain.enums.Role;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class DTOMapper {

    public static UserDTO toUserDTO(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole() != null ? user.getRole().toString() : null);
        return dto;
    }

    public static User toUser(CreateUserRequest request) {
        if (request == null) return null;
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(Role.fromString(request.getRole()));
        return user;
    }

    public static StudentDTO toStudentDTO(Student student) {
        if (student == null) return null;
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setUserId(student.getUserId());
        dto.setGender(student.getGender());
        dto.setDateOfBirth(student.getDateOfBirth());
        return dto;
    }

    public static List<StudentDTO> toStudentDTOList(List<Student> students) {
        if (students == null) return Collections.emptyList();
        return students.stream().map(DTOMapper::toStudentDTO).collect(Collectors.toList());
    }

    public static TeacherDTO toTeacherDTO(Teacher teacher) {
        if (teacher == null) return null;
        TeacherDTO dto = new TeacherDTO();
        dto.setId(teacher.getId());
        dto.setUserId(teacher.getUserId());
        dto.setSubjectSpecialty(teacher.getSubjectSpecialty());
        return dto;
    }

    public static List<TeacherDTO> toTeacherDTOList(List<Teacher> teachers) {
        if (teachers == null) return Collections.emptyList();
        return teachers.stream().map(DTOMapper::toTeacherDTO).collect(Collectors.toList());
    }

    public static ParentDTO toParentDTO(Parent parent) {
        if (parent == null) return null;
        ParentDTO dto = new ParentDTO();
        dto.setId(parent.getId());
        dto.setUserId(parent.getUserId());
        dto.setPhone(parent.getPhone());
        return dto;
    }

    public static List<ParentDTO> toParentDTOList(List<Parent> parents) {
        if (parents == null) return Collections.emptyList();
        return parents.stream().map(DTOMapper::toParentDTO).collect(Collectors.toList());
    }

    public static ClassroomDTO toClassroomDTO(Classroom classroom) {
        if (classroom == null) return null;
        ClassroomDTO dto = new ClassroomDTO();
        dto.setId(classroom.getId());
        dto.setName(classroom.getName());
        dto.setGrade(classroom.getGrade());
        dto.setSchoolYear(classroom.getSchoolYear());
        return dto;
    }

    public static List<ClassroomDTO> toClassroomDTOList(List<Classroom> classrooms) {
        if (classrooms == null) return Collections.emptyList();
        return classrooms.stream().map(DTOMapper::toClassroomDTO).collect(Collectors.toList());
    }

    public static SubjectDTO toSubjectDTO(Subject subject) {
        if (subject == null) return null;
        SubjectDTO dto = new SubjectDTO();
        dto.setId(subject.getId());
        dto.setName(subject.getName());
        dto.setDescription(subject.getDescription());
        return dto;
    }

    public static List<SubjectDTO> toSubjectDTOList(List<Subject> subjects) {
        if (subjects == null) return Collections.emptyList();
        return subjects.stream().map(DTOMapper::toSubjectDTO).collect(Collectors.toList());
    }

    public static GradeDTO toGradeDTO(Grade grade) {
        if (grade == null) return null;
        GradeDTO dto = new GradeDTO();
        dto.setId(grade.getId());
        dto.setStudentId(grade.getStudentId());
        dto.setSubjectId(grade.getSubjectId());
        dto.setClassroomId(grade.getClassroomId());
        dto.setScore(grade.getScore());
        return dto;
    }

    public static List<GradeDTO> toGradeDTOList(List<Grade> grades) {
        if (grades == null) return Collections.emptyList();
        return grades.stream().map(DTOMapper::toGradeDTO).collect(Collectors.toList());
    }

    public static AttendanceDTO toAttendanceDTO(Attendance attendance) {
        if (attendance == null) return null;
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setStudentId(attendance.getStudentId());
        dto.setClassroomId(attendance.getClassroomId());
        dto.setDate(attendance.getDate());
        dto.setStatus(attendance.getStatus().name());
        return dto;
    }

    public static List<AttendanceDTO> toAttendanceDTOList(List<Attendance> attendances) {
        if (attendances == null) return Collections.emptyList();
        return attendances.stream().map(DTOMapper::toAttendanceDTO).collect(Collectors.toList());
    }

    public static ClassroomSubjectDTO toClassroomSubjectDTO(ClassroomSubject cs) {
        if (cs == null) return null;
        ClassroomSubjectDTO dto = new ClassroomSubjectDTO();
        dto.setId(cs.getId());
        dto.setClassroomId(cs.getClassroomId());
        dto.setSubjectId(cs.getSubjectId());
        dto.setTeacherId(cs.getTeacherId());
        return dto;
    }

    public static List<ClassroomSubjectDTO> toClassroomSubjectDTOList(List<ClassroomSubject> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(DTOMapper::toClassroomSubjectDTO).collect(Collectors.toList());
    }

    public static StudentClassDTO toStudentClassDTO(StudentClass sc) {
        if (sc == null) return null;
        StudentClassDTO dto = new StudentClassDTO();
        dto.setId(sc.getId());
        dto.setStudentId(sc.getStudentId());
        dto.setClassroomId(sc.getClassroomId());
        return dto;
    }

    public static List<StudentClassDTO> toStudentClassDTOList(List<StudentClass> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(DTOMapper::toStudentClassDTO).collect(Collectors.toList());
    }

    public static AnnouncementDTO toAnnouncementDTO(Announcement announcement) {
        if (announcement == null) return null;
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setId(announcement.getId());
        dto.setTitle(announcement.getTitle());
        dto.setContent(announcement.getContent());
        dto.setPublishedAt(announcement.getPublishedAt());
        dto.setAuthorId(announcement.getAuthorId());
        return dto;
    }

    public static List<AnnouncementDTO> toAnnouncementDTOList(List<Announcement> announcements) {
        if (announcements == null) return Collections.emptyList();
        return announcements.stream().map(DTOMapper::toAnnouncementDTO).collect(Collectors.toList());
    }
}
