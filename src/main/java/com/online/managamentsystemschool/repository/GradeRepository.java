package com.online.managamentsystemschool.repository;

import com.online.managamentsystemschool.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Integer> {
    List<Grade> findByStudentId(Integer studentId);
    List<Grade> findBySubjectId(Integer subjectId);
    List<Grade> findByClassroomId(Integer classroomId);
    List<Grade> findByStudentIdAndSubjectId(Integer studentId, Integer subjectId);
    List<Grade> findByStudentIdAndClassroomId(Integer studentId, Integer classroomId);
    List<Grade> findByStudentUserEmail(String email);
}

