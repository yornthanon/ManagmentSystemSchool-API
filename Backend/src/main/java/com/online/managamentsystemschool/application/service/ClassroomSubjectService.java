package com.online.managamentsystemschool.application.service;

import com.online.managamentsystemschool.application.port.ClassroomSubjectRepository;
import com.online.managamentsystemschool.domain.model.ClassroomSubject;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClassroomSubjectService {
    private final ClassroomSubjectRepository classroomSubjectRepository;

    @Transactional
    public ClassroomSubject assignSubjectToClassroom(ClassroomSubject cs) {
        return classroomSubjectRepository.save(cs);
    }

    public Optional<ClassroomSubject> getClassroomSubjectById(Integer id) {
        return classroomSubjectRepository.findById(id);
    }

    public List<ClassroomSubject> getAllClassroomSubjects() {
        return classroomSubjectRepository.findAll();
    }

    public Page<ClassroomSubject> getAllClassroomSubjects(Pageable pageable) {
        return classroomSubjectRepository.findAll(pageable);
    }

    public List<ClassroomSubject> getClassroomSubjects(Integer classroomId) {
        return classroomSubjectRepository.findByClassroomId(classroomId);
    }

    public List<ClassroomSubject> getTeacherSubjects(Integer teacherId) {
        return classroomSubjectRepository.findByTeacherId(teacherId);
    }

    public List<ClassroomSubject> getSubjectClassrooms(Integer subjectId) {
        return classroomSubjectRepository.findBySubjectId(subjectId);
    }

    @Transactional
    public ClassroomSubject assignTeacherToSubject(Integer classroomSubjectId, Integer teacherId) {
        ClassroomSubject cs = classroomSubjectRepository.findById(classroomSubjectId)
                .orElseThrow(() -> new RuntimeException("Classroom-Subject not found"));
        cs.setTeacherId(teacherId);
        return classroomSubjectRepository.save(cs);
    }

    @Transactional
    public ClassroomSubject removeTeacher(Integer classroomSubjectId) {
        ClassroomSubject cs = classroomSubjectRepository.findById(classroomSubjectId)
                .orElseThrow(() -> new RuntimeException("Classroom-Subject not found"));
        cs.setTeacherId(null);
        return classroomSubjectRepository.save(cs);
    }

    @Transactional
    public void deleteClassroomSubject(Integer id) {
        classroomSubjectRepository.deleteById(id);
    }

    public long getAssignmentCount() {
        return classroomSubjectRepository.count();
    }
}
