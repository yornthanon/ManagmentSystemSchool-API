package com.online.managamentsystemschool.application.port;

import com.online.managamentsystemschool.domain.model.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface TeacherRepository {
    Optional<Teacher> findById(Integer id);
    List<Teacher> findByUserUsername(String username);
    List<Teacher> findBySubjectSpecialtyContainingIgnoreCase(String specialty);
    Page<Teacher> findAll(Pageable pageable);
    List<Teacher> findAll();
    Teacher save(Teacher teacher);
    void deleteById(Integer id);
    long count();
}
