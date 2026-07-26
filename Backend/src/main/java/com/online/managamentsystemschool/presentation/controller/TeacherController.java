package com.online.managamentsystemschool.presentation.controller;

import com.online.managamentsystemschool.presentation.dto.DTOMapper;
import com.online.managamentsystemschool.presentation.dto.request.CreateTeacherRequest;
import com.online.managamentsystemschool.presentation.dto.response.TeacherDTO;
import com.online.managamentsystemschool.domain.model.Teacher;
import com.online.managamentsystemschool.domain.model.User;
import com.online.managamentsystemschool.domain.enums.Role;
import com.online.managamentsystemschool.application.service.TeacherService;
import com.online.managamentsystemschool.application.service.UserService;
import jakarta.validation.Valid;
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
@RequestMapping("/teachers")
@RequiredArgsConstructor
public class TeacherController {
    private final TeacherService teacherService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherDTO> createTeacher(@Valid @RequestBody CreateTeacherRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setPassword(request.getPassword());
            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setRole(Role.TEACHER);
            User createdUser = userService.createUser(user);

            Teacher teacher = new Teacher();
            teacher.setUserId(createdUser.getId());
            teacher.setSubjectSpecialty(request.getSubjectSpecialty());
            Teacher created = teacherService.createTeacher(teacher);
            return ResponseEntity.status(HttpStatus.CREATED).body(DTOMapper.toTeacherDTO(created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Page<TeacherDTO>> getAllTeachers(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(teacherService.getAllTeachers(pageable).map(DTOMapper::toTeacherDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<TeacherDTO> getTeacherById(@PathVariable Integer id) {
        return teacherService.getTeacherById(id)
                .map(t -> ResponseEntity.ok(DTOMapper.toTeacherDTO(t)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<TeacherDTO> getTeacherByUsername(@PathVariable String username) {
        return teacherService.getTeacherByUsername(username)
                .map(t -> ResponseEntity.ok(DTOMapper.toTeacherDTO(t)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/subject/{subject}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<TeacherDTO>> getTeachersBySubject(@PathVariable String subject) {
        return ResponseEntity.ok(DTOMapper.toTeacherDTOList(teacherService.getTeachersBySubject(subject)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherDTO> updateTeacher(@PathVariable Integer id, @RequestBody Teacher teacherDetails) {
        try {
            Teacher updated = teacherService.updateTeacher(id, teacherDetails);
            return ResponseEntity.ok(DTOMapper.toTeacherDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Integer id) {
        try {
            teacherService.deleteTeacher(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getTeacherCount() {
        return ResponseEntity.ok(teacherService.getTeacherCount());
    }

    @PutMapping("/{id}/profile")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<TeacherDTO> updateTeacherProfile(
            @PathVariable Integer id,
            @RequestParam String fullName,
            @RequestParam String email,
            @RequestParam String subject) {
        try {
            Teacher updated = teacherService.updateTeacherProfile(id, fullName, email, subject);
            return ResponseEntity.ok(DTOMapper.toTeacherDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
