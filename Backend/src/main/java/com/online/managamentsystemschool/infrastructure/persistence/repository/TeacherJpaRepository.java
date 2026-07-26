package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.infrastructure.persistence.entity.TeacherEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherJpaRepository extends JpaRepository<TeacherEntity, Integer> {
    List<TeacherEntity> findByUserUsername(String username);
    List<TeacherEntity> findBySubjectSpecialtyContainingIgnoreCase(String specialty);
}
