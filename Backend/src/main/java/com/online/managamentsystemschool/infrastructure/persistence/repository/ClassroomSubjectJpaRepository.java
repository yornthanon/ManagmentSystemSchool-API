package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.infrastructure.persistence.entity.ClassroomSubjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassroomSubjectJpaRepository extends JpaRepository<ClassroomSubjectEntity, Integer> {
    List<ClassroomSubjectEntity> findByClassroomId(Integer classroomId);
    List<ClassroomSubjectEntity> findByTeacherId(Integer teacherId);
    List<ClassroomSubjectEntity> findBySubjectId(Integer subjectId);
}
