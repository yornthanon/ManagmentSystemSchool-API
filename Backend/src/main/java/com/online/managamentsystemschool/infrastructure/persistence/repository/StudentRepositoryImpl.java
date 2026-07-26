package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.application.port.StudentRepository;
import com.online.managamentsystemschool.domain.model.Student;
import com.online.managamentsystemschool.infrastructure.persistence.mapper.StudentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class StudentRepositoryImpl implements StudentRepository {
    private final StudentJpaRepository jpaRepository;

    @Override
    public Optional<Student> findById(Integer id) {
        return jpaRepository.findById(id).map(StudentMapper::toDomain);
    }

    @Override
    public Optional<Student> findByUserEmail(String email) {
        return jpaRepository.findByUserEmail(email).map(StudentMapper::toDomain);
    }

    @Override
    public List<Student> findByUserUsername(String username) {
        return jpaRepository.findByUserUsername(username).stream().map(StudentMapper::toDomain).toList();
    }

    @Override
    public Page<Student> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(StudentMapper::toDomain);
    }

    @Override
    public List<Student> findAll() {
        return jpaRepository.findAll().stream().map(StudentMapper::toDomain).toList();
    }

    @Override
    public Student save(Student student) {
        return StudentMapper.toDomain(jpaRepository.save(StudentMapper.toEntity(student)));
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
