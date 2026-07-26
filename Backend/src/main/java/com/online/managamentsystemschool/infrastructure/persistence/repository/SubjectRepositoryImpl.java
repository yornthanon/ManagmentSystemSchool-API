package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.application.port.SubjectRepository;
import com.online.managamentsystemschool.domain.model.Subject;
import com.online.managamentsystemschool.infrastructure.persistence.mapper.SubjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class SubjectRepositoryImpl implements SubjectRepository {
    private final SubjectJpaRepository jpaRepository;

    @Override
    public Optional<Subject> findById(Integer id) {
        return jpaRepository.findById(id).map(SubjectMapper::toDomain);
    }

    @Override
    public Optional<Subject> findByNameIgnoreCase(String name) {
        return Optional.ofNullable(jpaRepository.findByNameIgnoreCase(name)).map(SubjectMapper::toDomain);
    }

    @Override
    public List<Subject> findByNameContainingIgnoreCase(String name) {
        return jpaRepository.findByNameContainingIgnoreCase(name).stream().map(SubjectMapper::toDomain).toList();
    }

    @Override
    public Page<Subject> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(SubjectMapper::toDomain);
    }

    @Override
    public List<Subject> findAll() {
        return jpaRepository.findAll().stream().map(SubjectMapper::toDomain).toList();
    }

    @Override
    public Subject save(Subject subject) {
        return SubjectMapper.toDomain(jpaRepository.save(SubjectMapper.toEntity(subject)));
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public long count() {
        return jpaRepository.count();
    }
}
