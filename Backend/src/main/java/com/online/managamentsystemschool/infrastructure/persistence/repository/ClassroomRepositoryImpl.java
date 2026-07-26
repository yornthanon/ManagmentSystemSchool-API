package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.application.port.ClassroomRepository;
import com.online.managamentsystemschool.domain.model.Classroom;
import com.online.managamentsystemschool.infrastructure.persistence.mapper.ClassroomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ClassroomRepositoryImpl implements ClassroomRepository {
    private final ClassroomJpaRepository jpaRepository;

    @Override
    public Optional<Classroom> findById(Integer id) {
        return jpaRepository.findById(id).map(ClassroomMapper::toDomain);
    }

    @Override
    public List<Classroom> findByGrade(String grade) {
        return jpaRepository.findByGrade(grade).stream().map(ClassroomMapper::toDomain).toList();
    }

    @Override
    public List<Classroom> findBySchoolYear(Integer schoolYear) {
        return jpaRepository.findBySchoolYear(schoolYear).stream().map(ClassroomMapper::toDomain).toList();
    }

    @Override
    public List<Classroom> findByGradeAndSchoolYear(String grade, Integer schoolYear) {
        return jpaRepository.findByGradeAndSchoolYear(grade, schoolYear).stream().map(ClassroomMapper::toDomain).toList();
    }

    @Override
    public Page<Classroom> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(ClassroomMapper::toDomain);
    }

    @Override
    public List<Classroom> findAll() {
        return jpaRepository.findAll().stream().map(ClassroomMapper::toDomain).toList();
    }

    @Override
    public Classroom save(Classroom classroom) {
        return ClassroomMapper.toDomain(jpaRepository.save(ClassroomMapper.toEntity(classroom)));
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public long count() {
        return jpaRepository.count();
    }

    @Override
    public long countStudentsByClassroomId(Integer classroomId) {
        return jpaRepository.countStudentsByClassroomId(classroomId);
    }
}
