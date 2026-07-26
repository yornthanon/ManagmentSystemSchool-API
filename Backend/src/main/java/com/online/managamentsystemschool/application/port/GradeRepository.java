package com.online.managamentsystemschool.application.port;

import com.online.managamentsystemschool.domain.model.Grade;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface GradeRepository {
    Optional<Grade> findById(Integer id);
    List<Grade> findByStudentId(Integer studentId);
    List<Grade> findBySubjectId(Integer subjectId);
    List<Grade> findByClassroomId(Integer classroomId);
    List<Grade> findByStudentIdAndSubjectId(Integer studentId, Integer subjectId);
    List<Grade> findByStudentIdAndClassroomId(Integer studentId, Integer classroomId);
    List<Grade> findByStudentUserEmail(String email);
    Page<Grade> findAll(Pageable pageable);
    List<Grade> findAll();
    Grade save(Grade grade);
    void deleteById(Integer id);
}
