package com.online.managamentsystemschool.application.port;

import com.online.managamentsystemschool.domain.model.Classroom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ClassroomRepository {
    Optional<Classroom> findById(Integer id);
    List<Classroom> findByGrade(String grade);
    List<Classroom> findBySchoolYear(Integer schoolYear);
    List<Classroom> findByGradeAndSchoolYear(String grade, Integer schoolYear);
    Page<Classroom> findAll(Pageable pageable);
    List<Classroom> findAll();
    Classroom save(Classroom classroom);
    void deleteById(Integer id);
    long count();
    long countStudentsByClassroomId(Integer classroomId);
}
