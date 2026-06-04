package com.online.managamentsystemschool.service;

import com.online.managamentsystemschool.entity.Attendance;
import com.online.managamentsystemschool.entity.Classroom;
import com.online.managamentsystemschool.entity.Student;
import com.online.managamentsystemschool.entity.enums.AttendanceStatus;
import com.online.managamentsystemschool.repository.AttendanceRepository;
import com.online.managamentsystemschool.repository.ClassroomRepository;
import com.online.managamentsystemschool.repository.StudentRepository;
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
    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;

    @Transactional
    public Attendance markAttendance(Integer studentId, Integer classroomId, LocalDate date, String status) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        
        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setClassroom(classroom);
        attendance.setDate(date);
        attendance.setStatus(AttendanceStatus.valueOf(status.toUpperCase()));
        
        return attendanceRepository.save(attendance);
    }

    /**
     * Get attendance by ID
     */
    public Optional<Attendance> getAttendanceById(Integer id) {
        return attendanceRepository.findById(id);
    }

    /**
     * Get all attendance records
     */
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public Page<Attendance> getAllAttendance(Pageable pageable) {
        return attendanceRepository.findAll(pageable);
    }

    /**
     * Get attendance records for a student
     */
    public List<Attendance> getStudentAttendance(Integer studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getStudentAttendanceByEmail(String email) {
        return attendanceRepository.findByStudentUserEmail(email);
    }

    /**
     * Get attendance records for a classroom
     */
    public List<Attendance> getClassroomAttendance(Integer classroomId) {
        return attendanceRepository.findByClassroomId(classroomId);
    }

    /**
     * Get attendance for a specific date
     */
    public List<Attendance> getAttendanceByDate(Integer studentId, LocalDate date) {
        return attendanceRepository.findByStudentIdAndDate(studentId, date);
    }

    /**
     * Get attendance for classroom on specific date
     */
    public List<Attendance> getClassroomAttendanceByDate(Integer classroomId, LocalDate date) {
        return attendanceRepository.findByClassroomIdAndDate(classroomId, date);
    }

    /**
     * Get attendance between dates
     */
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

    /**
     * Calculate attendance percentage for student
     */
    public double getAttendancePercentage(Integer studentId, Integer classroomId) {
        List<Attendance> records = attendanceRepository
                .findByStudentIdAndClassroomIdAndDateBetween(studentId, classroomId, LocalDate.MIN, LocalDate.MAX);
        
        if (records.isEmpty()) {
            return 0.0;
        }
        
        long presentDays = records.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                .count();
        
        return (presentDays * 100.0) / records.size();
    }
}

