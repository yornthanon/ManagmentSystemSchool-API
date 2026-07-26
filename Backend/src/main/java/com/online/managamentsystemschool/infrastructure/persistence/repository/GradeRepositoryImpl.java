package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.application.port.GradeRepository;
import com.online.managamentsystemschool.domain.model.Grade;
import com.online.managamentsystemschool.infrastructure.persistence.mapper.GradeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class GradeRepositoryImpl implements GradeRepository {
    private final GradeJpaRepository jpaRepository;

    @Override
    public Optional<Grade> findById(Integer id) {
        return jpaRepository.findById(id).map(GradeMapper::toDomain);
    }

    @Override
    public List<Grade> findByStudentId(Integer studentId) {
        return jpaRepository.findByStudentId(studentId).stream().map(GradeMapper::toDomain).toList();
    }

    @Override
    public List<Grade> findBySubjectId(Integer subjectId) {
        return jpaRepository.findBySubjectId(subjectId).stream().map(GradeMapper::toDomain).toList();
    }

    @Override
    public List<Grade> findByClassroomId(Integer classroomId) {
        return jpaRepository.findByClassroomId(classroomId).stream().map(GradeMapper::toDomain).toList();
    }

    @Override
    public List<Grade> findByStudentIdAndSubjectId(Integer studentId, Integer subjectId) {
        return jpaRepository.findByStudentIdAndSubjectId(studentId, subjectId).stream().map(GradeMapper::toDomain).toList();
    }

    @Override
    public List<Grade> findByStudentIdAndClassroomId(Integer studentId, Integer classroomId) {
        return jpaRepository.findByStudentIdAndClassroomId(studentId, classroomId).stream().map(GradeMapper::toDomain).toList();
    }

    @Override
    public List<Grade> findByStudentUserEmail(String email) {
        return jpaRepository.findByStudentUserEmail(email).stream().map(GradeMapper::toDomain).toList();
    }

    @Override
    public Page<Grade> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(GradeMapper::toDomain);
    }

    @Override
    public List<Grade> findAll() {
        return jpaRepository.findAll().stream().map(GradeMapper::toDomain).toList();
    }

    @Override
    public Grade save(Grade grade) {
        return GradeMapper.toDomain(jpaRepository.save(GradeMapper.toEntity(grade)));
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }
}
