package com.online.managamentsystemschool.application.port;

import com.online.managamentsystemschool.domain.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface StudentRepository {
    Optional<Student> findById(Integer id);
    Optional<Student> findByUserEmail(String email);
    List<Student> findByUserUsername(String username);
    Page<Student> findAll(Pageable pageable);
    List<Student> findAll();
    Student save(Student student);
    void deleteById(Integer id);
    long count();
}
