package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.infrastructure.persistence.entity.GradeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GradeJpaRepository extends JpaRepository<GradeEntity, Integer> {
    List<GradeEntity> findByStudentId(Integer studentId);
    List<GradeEntity> findBySubjectId(Integer subjectId);
    List<GradeEntity> findByClassroomId(Integer classroomId);
    List<GradeEntity> findByStudentIdAndSubjectId(Integer studentId, Integer subjectId);
    List<GradeEntity> findByStudentIdAndClassroomId(Integer studentId, Integer classroomId);
    List<GradeEntity> findByStudentUserEmail(String email);
}
