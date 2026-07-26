package com.online.managamentsystemschool.application.port;

import com.online.managamentsystemschool.domain.model.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository {
    Optional<Subject> findById(Integer id);
    Optional<Subject> findByNameIgnoreCase(String name);
    List<Subject> findByNameContainingIgnoreCase(String name);
    Page<Subject> findAll(Pageable pageable);
    List<Subject> findAll();
    Subject save(Subject subject);
    void deleteById(Integer id);
    long count();
}
