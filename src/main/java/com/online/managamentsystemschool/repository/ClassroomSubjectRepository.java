package com.online.managamentsystemschool.repository;

import com.online.managamentsystemschool.entity.ClassroomSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomSubjectRepository extends JpaRepository<ClassroomSubject, Integer> {
    List<ClassroomSubject> findByClassroomId(Integer classroomId);
    List<ClassroomSubject> findByTeacherId(Integer teacherId);
    List<ClassroomSubject> findBySubjectId(Integer subjectId);
}

