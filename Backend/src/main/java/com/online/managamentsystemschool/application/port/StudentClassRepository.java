package com.online.managamentsystemschool.application.port;

import com.online.managamentsystemschool.domain.model.StudentClass;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface StudentClassRepository {
    Optional<StudentClass> findById(Integer id);
    List<StudentClass> findByStudentId(Integer studentId);
    List<StudentClass> findByClassroomId(Integer classroomId);
    boolean existsByStudentIdAndClassroomId(Integer studentId, Integer classroomId);
    Page<StudentClass> findAll(Pageable pageable);
    List<StudentClass> findAll();
    StudentClass save(StudentClass studentClass);
    void deleteById(Integer id);
    long count();
}
