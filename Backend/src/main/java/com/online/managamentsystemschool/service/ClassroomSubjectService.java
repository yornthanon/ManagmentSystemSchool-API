package com.online.managamentsystemschool.service;

import com.online.managamentsystemschool.entity.ClassroomSubject;
import com.online.managamentsystemschool.entity.Classroom;
import com.online.managamentsystemschool.entity.Subject;
import com.online.managamentsystemschool.entity.Teacher;
import com.online.managamentsystemschool.repository.ClassroomSubjectRepository;
import com.online.managamentsystemschool.repository.ClassroomRepository;
import com.online.managamentsystemschool.repository.SubjectRepository;
import com.online.managamentsystemschool.repository.TeacherRepository;
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
    private final ClassroomRepository classroomRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;

    @Transactional
    public ClassroomSubject assignSubjectToClassroom(Integer classroomId, Integer subjectId, Integer teacherId) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        Teacher teacher = null;
        if (teacherId != null) {
            teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
        }

        ClassroomSubject classroomSubject = new ClassroomSubject();
        classroomSubject.setClassroom(classroom);
        classroomSubject.setSubject(subject);
        classroomSubject.setTeacher(teacher);

        return classroomSubjectRepository.save(classroomSubject);
    }

    /**
     * Get classroom-subject by ID
     */
    public Optional<ClassroomSubject> getClassroomSubjectById(Integer id) {
        return classroomSubjectRepository.findById(id);
    }

    /**
     * Get all classroom-subject assignments
     */
    public List<ClassroomSubject> getAllClassroomSubjects() {
        return classroomSubjectRepository.findAll();
    }

    public Page<ClassroomSubject> getAllClassroomSubjects(Pageable pageable) {
        return classroomSubjectRepository.findAll(pageable);
    }

    /**
     * Get subjects in a classroom
     */
    public List<ClassroomSubject> getClassroomSubjects(Integer classroomId) {
        return classroomSubjectRepository.findByClassroomId(classroomId);
    }

    /**
     * Get subjects taught by a teacher
     */
    public List<ClassroomSubject> getTeacherSubjects(Integer teacherId) {
        return classroomSubjectRepository.findByTeacherId(teacherId);
    }

    /**
     * Get classrooms teaching a subject
     */
    public List<ClassroomSubject> getSubjectClassrooms(Integer subjectId) {
        return classroomSubjectRepository.findBySubjectId(subjectId);
    }

    @Transactional
    public ClassroomSubject assignTeacherToSubject(Integer classroomSubjectId, Integer teacherId) {
        ClassroomSubject classroomSubject = classroomSubjectRepository.findById(classroomSubjectId)
                .orElseThrow(() -> new RuntimeException("Classroom-Subject not found"));

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        classroomSubject.setTeacher(teacher);
        return classroomSubjectRepository.save(classroomSubject);
    }

    @Transactional
    public ClassroomSubject removeTeacher(Integer classroomSubjectId) {
        ClassroomSubject classroomSubject = classroomSubjectRepository.findById(classroomSubjectId)
                .orElseThrow(() -> new RuntimeException("Classroom-Subject not found"));

        classroomSubject.setTeacher(null);
        return classroomSubjectRepository.save(classroomSubject);
    }

    @Transactional
    public void deleteClassroomSubject(Integer id) {
        classroomSubjectRepository.deleteById(id);
    }

    /**
     * Get total assignments
     */
    public long getAssignmentCount() {
        return classroomSubjectRepository.count();
    }
}

