package com.online.managamentsystemschool.presentation.controller;

import com.online.managamentsystemschool.presentation.dto.DTOMapper;
import com.online.managamentsystemschool.presentation.dto.response.ClassroomSubjectDTO;
import com.online.managamentsystemschool.application.service.ClassroomSubjectService;
import com.online.managamentsystemschool.domain.model.ClassroomSubject;
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
@RequestMapping("/classroom-subjects")
@RequiredArgsConstructor
public class ClassroomSubjectController {

    private final ClassroomSubjectService classroomSubjectService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassroomSubjectDTO> assignSubjectToClassroom(
            @RequestParam Integer classroomId,
            @RequestParam Integer subjectId,
            @RequestParam(required = false) Integer teacherId) {
        try {
            ClassroomSubject cs = new ClassroomSubject();
            cs.setClassroomId(classroomId);
            cs.setSubjectId(subjectId);
            cs.setTeacherId(teacherId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(DTOMapper.toClassroomSubjectDTO(
                            classroomSubjectService.assignSubjectToClassroom(cs)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Page<ClassroomSubjectDTO>> getAllClassroomSubjects(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(
                classroomSubjectService.getAllClassroomSubjects(pageable).map(DTOMapper::toClassroomSubjectDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ClassroomSubjectDTO> getClassroomSubjectById(@PathVariable Integer id) {
        return classroomSubjectService.getClassroomSubjectById(id)
                .map(cs -> ResponseEntity.ok(DTOMapper.toClassroomSubjectDTO(cs)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/classroom/{classroomId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<ClassroomSubjectDTO>> getClassroomSubjects(@PathVariable Integer classroomId) {
        return ResponseEntity.ok(
                DTOMapper.toClassroomSubjectDTOList(classroomSubjectService.getClassroomSubjects(classroomId)));
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<ClassroomSubjectDTO>> getTeacherSubjects(@PathVariable Integer teacherId) {
        return ResponseEntity.ok(
                DTOMapper.toClassroomSubjectDTOList(classroomSubjectService.getTeacherSubjects(teacherId)));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClassroomSubjectDTO>> getSubjectClassrooms(@PathVariable Integer subjectId) {
        return ResponseEntity.ok(
                DTOMapper.toClassroomSubjectDTOList(classroomSubjectService.getSubjectClassrooms(subjectId)));
    }

    @PutMapping("/{classroomSubjectId}/teacher/{teacherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassroomSubjectDTO> assignTeacherToSubject(
            @PathVariable Integer classroomSubjectId, @PathVariable Integer teacherId) {
        try {
            return ResponseEntity.ok(DTOMapper.toClassroomSubjectDTO(
                    classroomSubjectService.assignTeacherToSubject(classroomSubjectId, teacherId)));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{classroomSubjectId}/teacher")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassroomSubjectDTO> removeTeacher(@PathVariable Integer classroomSubjectId) {
        try {
            return ResponseEntity.ok(DTOMapper.toClassroomSubjectDTO(
                    classroomSubjectService.removeTeacher(classroomSubjectId)));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClassroomSubject(@PathVariable Integer id) {
        try {
            classroomSubjectService.deleteClassroomSubject(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Long> getAssignmentCount() {
        return ResponseEntity.ok(classroomSubjectService.getAssignmentCount());
    }
}
