package com.online.managamentsystemschool.presentation.controller;

import com.online.managamentsystemschool.presentation.dto.DTOMapper;
import com.online.managamentsystemschool.presentation.dto.response.AttendanceDTO;
import com.online.managamentsystemschool.application.service.AttendanceService;
import com.online.managamentsystemschool.domain.model.Attendance;
import com.online.managamentsystemschool.domain.enums.AttendanceStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<AttendanceDTO> markAttendance(
            @RequestParam Integer studentId,
            @RequestParam Integer classroomId,
            @RequestParam LocalDate date,
            @RequestParam String status) {
        try {
            Attendance attendance = new Attendance();
            attendance.setStudentId(studentId);
            attendance.setClassroomId(classroomId);
            attendance.setDate(date);
            attendance.setStatus(AttendanceStatus.valueOf(status.toUpperCase()));
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(DTOMapper.toAttendanceDTO(attendanceService.markAttendance(attendance)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<AttendanceDTO>> getMyAttendance(Authentication authentication) {
        return ResponseEntity.ok(DTOMapper.toAttendanceDTOList(
                attendanceService.getStudentAttendanceByEmail(authentication.getName())));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Page<AttendanceDTO>> getAllAttendance(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(attendanceService.getAllAttendance(pageable).map(DTOMapper::toAttendanceDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<AttendanceDTO> getAttendanceById(@PathVariable Integer id) {
        return attendanceService.getAttendanceById(id)
                .map(a -> ResponseEntity.ok(DTOMapper.toAttendanceDTO(a)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<List<AttendanceDTO>> getStudentAttendance(@PathVariable Integer studentId) {
        return ResponseEntity.ok(DTOMapper.toAttendanceDTOList(attendanceService.getStudentAttendance(studentId)));
    }

    @GetMapping("/classroom/{classroomId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<AttendanceDTO>> getClassroomAttendance(@PathVariable Integer classroomId) {
        return ResponseEntity.ok(DTOMapper.toAttendanceDTOList(attendanceService.getClassroomAttendance(classroomId)));
    }

    @GetMapping("/student/{studentId}/date/{date}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByDate(
            @PathVariable Integer studentId, @PathVariable LocalDate date) {
        return ResponseEntity.ok(DTOMapper.toAttendanceDTOList(attendanceService.getAttendanceByDate(studentId, date)));
    }

    @GetMapping("/classroom/{classroomId}/date/{date}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<AttendanceDTO>> getClassroomAttendanceByDate(
            @PathVariable Integer classroomId, @PathVariable LocalDate date) {
        return ResponseEntity.ok(DTOMapper.toAttendanceDTOList(
                attendanceService.getClassroomAttendanceByDate(classroomId, date)));
    }

    @GetMapping("/range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceBetweenDates(
            @RequestParam Integer studentId,
            @RequestParam Integer classroomId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(DTOMapper.toAttendanceDTOList(
                attendanceService.getAttendanceBetweenDates(studentId, classroomId, startDate, endDate)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<AttendanceDTO> updateAttendance(@PathVariable Integer id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(DTOMapper.toAttendanceDTO(attendanceService.updateAttendance(id, status)));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Integer id) {
        try {
            attendanceService.deleteAttendance(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/percentage")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Double> getAttendancePercentage(
            @RequestParam Integer studentId, @RequestParam Integer classroomId) {
        try {
            return ResponseEntity.ok(attendanceService.getAttendancePercentage(studentId, classroomId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
