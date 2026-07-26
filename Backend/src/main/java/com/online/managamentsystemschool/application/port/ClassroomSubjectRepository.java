package com.online.managamentsystemschool.application.port;

import com.online.managamentsystemschool.domain.model.ClassroomSubject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ClassroomSubjectRepository {
    Optional<ClassroomSubject> findById(Integer id);
    List<ClassroomSubject> findByClassroomId(Integer classroomId);
    List<ClassroomSubject> findByTeacherId(Integer teacherId);
    List<ClassroomSubject> findBySubjectId(Integer subjectId);
    Page<ClassroomSubject> findAll(Pageable pageable);
    List<ClassroomSubject> findAll();
    ClassroomSubject save(ClassroomSubject classroomSubject);
    void deleteById(Integer id);
    long count();
}
