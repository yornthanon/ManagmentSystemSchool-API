package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.infrastructure.persistence.entity.StudentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentJpaRepository extends JpaRepository<StudentEntity, Integer> {
    List<StudentEntity> findByUserUsername(String username);
    Optional<StudentEntity> findByUserEmail(String email);
}
