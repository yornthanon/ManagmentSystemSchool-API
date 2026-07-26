package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.infrastructure.persistence.entity.AttendanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceJpaRepository extends JpaRepository<AttendanceEntity, Integer> {
    List<AttendanceEntity> findByStudentId(Integer studentId);
    List<AttendanceEntity> findByClassroomId(Integer classroomId);
    List<AttendanceEntity> findByStudentIdAndDate(Integer studentId, LocalDate date);
    List<AttendanceEntity> findByClassroomIdAndDate(Integer classroomId, LocalDate date);
    List<AttendanceEntity> findByStudentIdAndClassroomIdAndDateBetween(Integer studentId, Integer classroomId, LocalDate startDate, LocalDate endDate);
    List<AttendanceEntity> findByStudentUserEmail(String email);
}
