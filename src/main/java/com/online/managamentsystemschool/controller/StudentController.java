package com.online.managamentsystemschool.controller;

import com.online.managamentsystemschool.dto.DTOMapper;
import com.online.managamentsystemschool.dto.request.CreateStudentRequest;
import com.online.managamentsystemschool.dto.response.StudentDTO;
import com.online.managamentsystemschool.entity.Student;
import com.online.managamentsystemschool.entity.User;
import com.online.managamentsystemschool.entity.enums.Role;
import com.online.managamentsystemschool.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<StudentDTO> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setPassword(request.getPassword());
            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
             user.setRole(Role.STUDENT);

            Student student = new Student();
            student.setUser(user);
            student.setGender(request.getGender());
            student.setDateOfBirth(request.getDateOfBirth());

            Student createdStudent = studentService.createStudent(student);
            return ResponseEntity.status(HttpStatus.CREATED).body(DTOMapper.toStudentDTO(createdStudent));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<StudentDTO>> getAllStudents(@PageableDefault(size = 20) Pageable pageable) {
        Page<StudentDTO> students = studentService.getAllStudents(pageable).map(DTOMapper::toStudentDTO);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Integer id) {
        return studentService.getStudentById(id)
                .map(s -> ResponseEntity.ok(DTOMapper.toStudentDTO(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<StudentDTO> getStudentByUsername(@PathVariable String username) {
        return studentService.getStudentByUsername(username)
                .map(s -> ResponseEntity.ok(DTOMapper.toStudentDTO(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable Integer id, @RequestBody Student studentDetails) {
        try {
            Student updatedStudent = studentService.updateStudent(id, studentDetails);
            return ResponseEntity.ok(DTOMapper.toStudentDTO(updatedStudent));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Integer id) {
        try {
            studentService.deleteStudent(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentDTO> getMyProfile(Authentication authentication) {
        return studentService.getStudentByEmail(authentication.getName())
                .map(s -> ResponseEntity.ok(DTOMapper.toStudentDTO(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getStudentCount() {
        long count = studentService.getStudentCount();
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/profile")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<StudentDTO> updateStudentProfile(
            @PathVariable Integer id,
            @RequestParam String fullName,
            @RequestParam String email) {
        try {
            Student updatedStudent = studentService.updateStudentProfile(id, fullName, email);
            return ResponseEntity.ok(DTOMapper.toStudentDTO(updatedStudent));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
