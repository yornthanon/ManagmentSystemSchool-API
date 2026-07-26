package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.application.port.TeacherRepository;
import com.online.managamentsystemschool.domain.model.Teacher;
import com.online.managamentsystemschool.infrastructure.persistence.mapper.TeacherMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class TeacherRepositoryImpl implements TeacherRepository {
    private final TeacherJpaRepository jpaRepository;

    @Override
    public Optional<Teacher> findById(Integer id) {
        return jpaRepository.findById(id).map(TeacherMapper::toDomain);
    }

    @Override
    public List<Teacher> findByUserUsername(String username) {
        return jpaRepository.findByUserUsername(username).stream().map(TeacherMapper::toDomain).toList();
    }

    @Override
    public List<Teacher> findBySubjectSpecialtyContainingIgnoreCase(String specialty) {
        return jpaRepository.findBySubjectSpecialtyContainingIgnoreCase(specialty).stream().map(TeacherMapper::toDomain).toList();
    }

    @Override
    public Page<Teacher> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(TeacherMapper::toDomain);
    }

    @Override
    public List<Teacher> findAll() {
        return jpaRepository.findAll().stream().map(TeacherMapper::toDomain).toList();
    }

    @Override
    public Teacher save(Teacher teacher) {
        return TeacherMapper.toDomain(jpaRepository.save(TeacherMapper.toEntity(teacher)));
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
