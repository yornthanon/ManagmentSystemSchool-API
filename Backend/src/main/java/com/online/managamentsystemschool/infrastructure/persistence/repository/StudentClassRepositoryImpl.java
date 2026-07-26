package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.application.port.StudentClassRepository;
import com.online.managamentsystemschool.domain.model.StudentClass;
import com.online.managamentsystemschool.infrastructure.persistence.mapper.StudentClassMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class StudentClassRepositoryImpl implements StudentClassRepository {
    private final StudentClassJpaRepository jpaRepository;

    @Override
    public Optional<StudentClass> findById(Integer id) {
        return jpaRepository.findById(id).map(StudentClassMapper::toDomain);
    }

    @Override
    public List<StudentClass> findByStudentId(Integer studentId) {
        return jpaRepository.findByStudentId(studentId).stream().map(StudentClassMapper::toDomain).toList();
    }

    @Override
    public List<StudentClass> findByClassroomId(Integer classroomId) {
        return jpaRepository.findByClassroomId(classroomId).stream().map(StudentClassMapper::toDomain).toList();
    }

    @Override
    public boolean existsByStudentIdAndClassroomId(Integer studentId, Integer classroomId) {
        return jpaRepository.existsByStudentIdAndClassroomId(studentId, classroomId);
    }

    @Override
    public Page<StudentClass> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(StudentClassMapper::toDomain);
    }

    @Override
    public List<StudentClass> findAll() {
        return jpaRepository.findAll().stream().map(StudentClassMapper::toDomain).toList();
    }

    @Override
    public StudentClass save(StudentClass studentClass) {
        return StudentClassMapper.toDomain(jpaRepository.save(StudentClassMapper.toEntity(studentClass)));
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
