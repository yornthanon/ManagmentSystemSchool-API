package com.online.managamentsystemschool.repository;

import com.online.managamentsystemschool.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Integer> {
    List<Teacher> findByUserUsername(String username);
    List<Teacher> findBySubjectSpecialtyContainingIgnoreCase(String specialty);
}

