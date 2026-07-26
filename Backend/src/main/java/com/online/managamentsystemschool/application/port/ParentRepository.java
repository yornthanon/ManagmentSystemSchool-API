package com.online.managamentsystemschool.application.port;

import com.online.managamentsystemschool.domain.model.Parent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ParentRepository {
    Optional<Parent> findById(Integer id);
    List<Parent> findByUserUsername(String username);
    List<Parent> findByPhone(String phone);
    Page<Parent> findAll(Pageable pageable);
    List<Parent> findAll();
    Parent save(Parent parent);
    void deleteById(Integer id);
}
