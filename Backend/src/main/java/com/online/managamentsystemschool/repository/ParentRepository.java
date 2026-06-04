package com.online.managamentsystemschool.repository;

import com.online.managamentsystemschool.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Integer> {
    List<Parent> findByUserUsername(String username);
    List<Parent> findByPhone(String phone);
}

