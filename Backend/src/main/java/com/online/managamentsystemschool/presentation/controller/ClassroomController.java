package com.online.managamentsystemschool.presentation.controller;

import com.online.managamentsystemschool.presentation.dto.DTOMapper;
import com.online.managamentsystemschool.presentation.dto.request.CreateClassroomRequest;
import com.online.managamentsystemschool.presentation.dto.response.ClassroomDTO;
import com.online.managamentsystemschool.domain.model.Classroom;
import com.online.managamentsystemschool.application.service.ClassroomService;
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
@RequestMapping("/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassroomDTO> createClassroom(@Valid @RequestBody CreateClassroomRequest request) {
        try {
            Classroom classroom = new Classroom();
            classroom.setName(request.getName());
            classroom.setGrade(request.getGrade());
            classroom.setSchoolYear(request.getSchoolYear());

            Classroom created = classroomService.createClassroom(classroom);
            return ResponseEntity.status(HttpStatus.CREATED).body(DTOMapper.toClassroomDTO(created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Page<ClassroomDTO>> getAllClassrooms(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(classroomService.getAllClassrooms(pageable).map(DTOMapper::toClassroomDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ClassroomDTO> getClassroomById(@PathVariable Integer id) {
        return classroomService.getClassroomById(id)
                .map(c -> ResponseEntity.ok(DTOMapper.toClassroomDTO(c)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/grade/{grade}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<ClassroomDTO>> getClassroomsByGrade(@PathVariable String grade) {
        return ResponseEntity.ok(DTOMapper.toClassroomDTOList(classroomService.getClassroomsByGrade(grade)));
    }

    @GetMapping("/year/{year}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<ClassroomDTO>> getClassroomsBySchoolYear(@PathVariable Integer year) {
        return ResponseEntity.ok(DTOMapper.toClassroomDTOList(classroomService.getClassroomsBySchoolYear(year)));
    }

    @GetMapping("/grade/{grade}/year/{year}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<ClassroomDTO>> getClassroomsByGradeAndYear(
            @PathVariable String grade, @PathVariable Integer year) {
        return ResponseEntity.ok(DTOMapper.toClassroomDTOList(
                classroomService.getClassroomsByGradeAndYear(grade, year)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassroomDTO> updateClassroom(@PathVariable Integer id, @RequestBody Classroom classroomDetails) {
        try {
            Classroom updated = classroomService.updateClassroom(id, classroomDetails);
            return ResponseEntity.ok(DTOMapper.toClassroomDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClassroom(@PathVariable Integer id) {
        try {
            classroomService.deleteClassroom(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Long> getClassroomCount() {
        return ResponseEntity.ok(classroomService.getClassroomCount());
    }

    @GetMapping("/{id}/student-count")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Long> getStudentCountInClassroom(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(classroomService.getStudentCountInClassroom(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
