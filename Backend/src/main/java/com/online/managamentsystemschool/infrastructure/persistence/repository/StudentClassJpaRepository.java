package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.infrastructure.persistence.entity.StudentClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentClassJpaRepository extends JpaRepository<StudentClassEntity, Integer> {
    List<StudentClassEntity> findByStudentId(Integer studentId);
    List<StudentClassEntity> findByClassroomId(Integer classroomId);
    boolean existsByStudentIdAndClassroomId(Integer studentId, Integer classroomId);
}
