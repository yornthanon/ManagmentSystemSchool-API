package com.online.managamentsystemschool.application.port;

import com.online.managamentsystemschool.domain.model.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository {
    Optional<Attendance> findById(Integer id);
    List<Attendance> findByStudentId(Integer studentId);
    List<Attendance> findByClassroomId(Integer classroomId);
    List<Attendance> findByStudentIdAndDate(Integer studentId, LocalDate date);
    List<Attendance> findByClassroomIdAndDate(Integer classroomId, LocalDate date);
    List<Attendance> findByStudentIdAndClassroomIdAndDateBetween(Integer studentId, Integer classroomId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findByStudentUserEmail(String email);
    Page<Attendance> findAll(Pageable pageable);
    List<Attendance> findAll();
    Attendance save(Attendance attendance);
    void deleteById(Integer id);
}
