package com.online.managamentsystemschool.repository;

import com.online.managamentsystemschool.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    List<Student> findByUserUsername(String username);
    Optional<Student> findByUserEmail(String email);
}

