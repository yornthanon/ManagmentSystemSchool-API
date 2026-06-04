package com.online.managamentsystemschool.repository;

import com.online.managamentsystemschool.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByStudentId(Integer studentId);
    List<Attendance> findByClassroomId(Integer classroomId);
    List<Attendance> findByStudentIdAndDate(Integer studentId, LocalDate date);
    List<Attendance> findByClassroomIdAndDate(Integer classroomId, LocalDate date);
    List<Attendance> findByStudentIdAndClassroomIdAndDateBetween(Integer studentId, Integer classroomId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findByStudentUserEmail(String email);
}

