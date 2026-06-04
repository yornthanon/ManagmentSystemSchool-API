package com.online.managamentsystemschool.repository;

import com.online.managamentsystemschool.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    Subject findByNameIgnoreCase(String name);
    List<Subject> findByNameContainingIgnoreCase(String name);
}

