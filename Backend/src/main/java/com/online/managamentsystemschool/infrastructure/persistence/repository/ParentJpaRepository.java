package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.infrastructure.persistence.entity.ParentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParentJpaRepository extends JpaRepository<ParentEntity, Integer> {
    List<ParentEntity> findByUserUsername(String username);
    List<ParentEntity> findByPhone(String phone);
}
