package com.school.grade;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/grade")
@PreAuthorize("hasRole('ADMIN')")
public class GradeController {

    @GetMapping
    public ResponseEntity<String> placeholder() {
        return ResponseEntity.ok("Grade module - not implemented yet");
    }
}
