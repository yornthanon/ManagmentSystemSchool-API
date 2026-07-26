package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.application.port.ClassroomSubjectRepository;
import com.online.managamentsystemschool.domain.model.ClassroomSubject;
import com.online.managamentsystemschool.infrastructure.persistence.mapper.ClassroomSubjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ClassroomSubjectRepositoryImpl implements ClassroomSubjectRepository {
    private final ClassroomSubjectJpaRepository jpaRepository;

    @Override
    public Optional<ClassroomSubject> findById(Integer id) {
        return jpaRepository.findById(id).map(ClassroomSubjectMapper::toDomain);
    }

    @Override
    public List<ClassroomSubject> findByClassroomId(Integer classroomId) {
        return jpaRepository.findByClassroomId(classroomId).stream().map(ClassroomSubjectMapper::toDomain).toList();
    }

    @Override
    public List<ClassroomSubject> findByTeacherId(Integer teacherId) {
        return jpaRepository.findByTeacherId(teacherId).stream().map(ClassroomSubjectMapper::toDomain).toList();
    }

    @Override
    public List<ClassroomSubject> findBySubjectId(Integer subjectId) {
        return jpaRepository.findBySubjectId(subjectId).stream().map(ClassroomSubjectMapper::toDomain).toList();
    }

    @Override
    public Page<ClassroomSubject> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(ClassroomSubjectMapper::toDomain);
    }

    @Override
    public List<ClassroomSubject> findAll() {
        return jpaRepository.findAll().stream().map(ClassroomSubjectMapper::toDomain).toList();
    }

    @Override
    public ClassroomSubject save(ClassroomSubject classroomSubject) {
        return ClassroomSubjectMapper.toDomain(jpaRepository.save(ClassroomSubjectMapper.toEntity(classroomSubject)));
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
