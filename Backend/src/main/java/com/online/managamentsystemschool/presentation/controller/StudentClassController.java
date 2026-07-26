package com.online.managamentsystemschool.presentation.controller;

import com.online.managamentsystemschool.presentation.dto.DTOMapper;
import com.online.managamentsystemschool.presentation.dto.response.StudentClassDTO;
import com.online.managamentsystemschool.application.service.StudentClassService;
import com.online.managamentsystemschool.domain.model.StudentClass;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student-classes")
@RequiredArgsConstructor
public class StudentClassController {

    private final StudentClassService studentClassService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentClassDTO> enrollStudentInClassroom(
            @RequestParam Integer studentId, @RequestParam Integer classroomId) {
        try {
            StudentClass sc = new StudentClass();
            sc.setStudentId(studentId);
            sc.setClassroomId(classroomId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(DTOMapper.toStudentClassDTO(
                            studentClassService.enrollStudentInClassroom(sc)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Page<StudentClassDTO>> getAllStudentClasses(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(
                studentClassService.getAllStudentClasses(pageable).map(DTOMapper::toStudentClassDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<StudentClassDTO> getStudentClassById(@PathVariable Integer id) {
        return studentClassService.getStudentClassById(id)
                .map(sc -> ResponseEntity.ok(DTOMapper.toStudentClassDTO(sc)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<List<StudentClassDTO>> getStudentClassrooms(@PathVariable Integer studentId) {
        return ResponseEntity.ok(
                DTOMapper.toStudentClassDTOList(studentClassService.getStudentClassrooms(studentId)));
    }

    @GetMapping("/classroom/{classroomId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<StudentClassDTO>> getClassroomStudents(@PathVariable Integer classroomId) {
        return ResponseEntity.ok(
                DTOMapper.toStudentClassDTOList(studentClassService.getClassroomStudents(classroomId)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unenrollStudentFromClassroom(@PathVariable Integer id) {
        try {
            studentClassService.unenrollStudentFromClassroom(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/check")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<Boolean> isStudentEnrolledInClassroom(
            @RequestParam Integer studentId, @RequestParam Integer classroomId) {
        return ResponseEntity.ok(
                studentClassService.isStudentEnrolledInClassroom(studentId, classroomId));
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Long> getEnrollmentCount() {
        return ResponseEntity.ok(studentClassService.getEnrollmentCount());
    }
}
