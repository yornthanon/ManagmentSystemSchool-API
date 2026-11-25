package com.school.classroom;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/classrooms")
@PreAuthorize("hasRole('ADMIN')")
public class ClassroomController {

    private final ClassroomService classroomService;

    public ClassroomController(ClassroomService classroomService) {
        this.classroomService = classroomService;
    }

    @GetMapping
    public ResponseEntity<List<Classroom>> findAll() {
        return ResponseEntity.ok(classroomService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Classroom> findById(@PathVariable Long id) {
        return classroomService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Classroom> create(@RequestBody Classroom classroom) {
        return ResponseEntity.ok(classroomService.create(classroom));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Classroom> update(@PathVariable Long id, @RequestBody Classroom classroom) {
        return ResponseEntity.ok(classroomService.update(id, classroom));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classroomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
