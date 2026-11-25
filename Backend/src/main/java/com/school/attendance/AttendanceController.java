package com.school.attendance;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/attendance")
@PreAuthorize("hasRole('ADMIN')")
public class AttendanceController {

    @GetMapping
    public ResponseEntity<String> placeholder() {
        return ResponseEntity.ok("Attendance module - not implemented yet");
    }
}
