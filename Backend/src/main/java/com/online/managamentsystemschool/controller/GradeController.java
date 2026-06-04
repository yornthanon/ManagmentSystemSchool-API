package com.online.managamentsystemschool.controller;

import com.online.managamentsystemschool.dto.DTOMapper;
import com.online.managamentsystemschool.dto.response.GradeDTO;
import com.online.managamentsystemschool.service.GradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<GradeDTO> recordGrade(
            @RequestParam Integer studentId,
            @RequestParam Integer subjectId,
            @RequestParam Integer classroomId,
            @RequestParam BigDecimal score) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(DTOMapper.toGradeDTO(gradeService.recordGrade(studentId, subjectId, classroomId, score)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<GradeDTO>> getMyGrades(Authentication authentication) {
        return ResponseEntity.ok(DTOMapper.toGradeDTOList(
                gradeService.getStudentGradesByEmail(authentication.getName())));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Page<GradeDTO>> getAllGrades(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(gradeService.getAllGrades(pageable).map(DTOMapper::toGradeDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<GradeDTO> getGradeById(@PathVariable Integer id) {
        return gradeService.getGradeById(id)
                .map(g -> ResponseEntity.ok(DTOMapper.toGradeDTO(g)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<List<GradeDTO>> getStudentGrades(@PathVariable Integer studentId) {
        return ResponseEntity.ok(DTOMapper.toGradeDTOList(gradeService.getStudentGrades(studentId)));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<GradeDTO>> getSubjectGrades(@PathVariable Integer subjectId) {
        return ResponseEntity.ok(DTOMapper.toGradeDTOList(gradeService.getSubjectGrades(subjectId)));
    }

    @GetMapping("/classroom/{classroomId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<GradeDTO>> getClassroomGrades(@PathVariable Integer classroomId) {
        return ResponseEntity.ok(DTOMapper.toGradeDTOList(gradeService.getClassroomGrades(classroomId)));
    }

    @GetMapping("/student/{studentId}/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<List<GradeDTO>> getStudentSubjectGrades(
            @PathVariable Integer studentId, @PathVariable Integer subjectId) {
        return ResponseEntity.ok(DTOMapper.toGradeDTOList(
                gradeService.getStudentSubjectGrades(studentId, subjectId)));
    }

    @GetMapping("/student/{studentId}/classroom/{classroomId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<List<GradeDTO>> getStudentClassroomGrades(
            @PathVariable Integer studentId, @PathVariable Integer classroomId) {
        return ResponseEntity.ok(DTOMapper.toGradeDTOList(
                gradeService.getStudentClassroomGrades(studentId, classroomId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<GradeDTO> updateGrade(@PathVariable Integer id, @RequestParam BigDecimal score) {
        try {
            return ResponseEntity.ok(DTOMapper.toGradeDTO(gradeService.updateGrade(id, score)));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGrade(@PathVariable Integer id) {
        try {
            gradeService.deleteGrade(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/student/{studentId}/average")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<BigDecimal> getStudentAverageGrade(@PathVariable Integer studentId) {
        return ResponseEntity.ok(gradeService.getStudentAverageGrade(studentId));
    }

    @GetMapping("/subject/{subjectId}/average")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<BigDecimal> getSubjectAverageGrade(@PathVariable Integer subjectId) {
        return ResponseEntity.ok(gradeService.getSubjectAverageGrade(subjectId));
    }

    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> getGradeStatus(@RequestParam BigDecimal score) {
        return ResponseEntity.ok(gradeService.getGradeStatus(score));
    }
}
