package com.online.managamentsystemschool.application.service;

import com.online.managamentsystemschool.application.port.AttendanceRepository;
import com.online.managamentsystemschool.domain.model.Attendance;
import com.online.managamentsystemschool.domain.enums.AttendanceStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public Attendance markAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    public Optional<Attendance> getAttendanceById(Integer id) {
        return attendanceRepository.findById(id);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public Page<Attendance> getAllAttendance(Pageable pageable) {
        return attendanceRepository.findAll(pageable);
    }

    public List<Attendance> getStudentAttendance(Integer studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getStudentAttendanceByEmail(String email) {
        return attendanceRepository.findByStudentUserEmail(email);
    }

    public List<Attendance> getClassroomAttendance(Integer classroomId) {
        return attendanceRepository.findByClassroomId(classroomId);
    }

    public List<Attendance> getAttendanceByDate(Integer studentId, LocalDate date) {
        return attendanceRepository.findByStudentIdAndDate(studentId, date);
    }

    public List<Attendance> getClassroomAttendanceByDate(Integer classroomId, LocalDate date) {
        return attendanceRepository.findByClassroomIdAndDate(classroomId, date);
    }

    public List<Attendance> getAttendanceBetweenDates(Integer studentId, Integer classroomId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByStudentIdAndClassroomIdAndDateBetween(studentId, classroomId, startDate, endDate);
    }

    @Transactional
    public Attendance updateAttendance(Integer id, String status) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        attendance.setStatus(AttendanceStatus.valueOf(status.toUpperCase()));
        return attendanceRepository.save(attendance);
    }

    @Transactional
    public void deleteAttendance(Integer id) {
        attendanceRepository.deleteById(id);
    }

    public double getAttendancePercentage(Integer studentId, Integer classroomId) {
        List<Attendance> records = attendanceRepository
                .findByStudentIdAndClassroomIdAndDateBetween(studentId, classroomId, LocalDate.MIN, LocalDate.MAX);
        if (records.isEmpty()) return 0.0;
        long presentDays = records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        return (presentDays * 100.0) / records.size();
    }
}
