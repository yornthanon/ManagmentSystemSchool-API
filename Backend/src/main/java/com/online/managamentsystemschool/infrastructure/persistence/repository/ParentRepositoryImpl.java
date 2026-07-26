package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.application.port.ParentRepository;
import com.online.managamentsystemschool.domain.model.Parent;
import com.online.managamentsystemschool.infrastructure.persistence.mapper.ParentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ParentRepositoryImpl implements ParentRepository {
    private final ParentJpaRepository jpaRepository;

    @Override
    public Optional<Parent> findById(Integer id) {
        return jpaRepository.findById(id).map(ParentMapper::toDomain);
    }

    @Override
    public List<Parent> findByUserUsername(String username) {
        return jpaRepository.findByUserUsername(username).stream().map(ParentMapper::toDomain).toList();
    }

    @Override
    public List<Parent> findByPhone(String phone) {
        return jpaRepository.findByPhone(phone).stream().map(ParentMapper::toDomain).toList();
    }

    @Override
    public Page<Parent> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(ParentMapper::toDomain);
    }

    @Override
    public List<Parent> findAll() {
        return jpaRepository.findAll().stream().map(ParentMapper::toDomain).toList();
    }

    @Override
    public Parent save(Parent parent) {
        return ParentMapper.toDomain(jpaRepository.save(ParentMapper.toEntity(parent)));
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }
}
