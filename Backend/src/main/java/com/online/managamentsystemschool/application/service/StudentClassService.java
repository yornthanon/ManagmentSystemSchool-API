package com.online.managamentsystemschool.application.service;

import com.online.managamentsystemschool.application.port.StudentClassRepository;
import com.online.managamentsystemschool.domain.model.StudentClass;
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
public class StudentClassService {
    private final StudentClassRepository studentClassRepository;

    @Transactional
    public StudentClass enrollStudentInClassroom(StudentClass studentClass) {
        return studentClassRepository.save(studentClass);
    }

    public Optional<StudentClass> getStudentClassById(Integer id) {
        return studentClassRepository.findById(id);
    }

    public List<StudentClass> getAllStudentClasses() {
        return studentClassRepository.findAll();
    }

    public Page<StudentClass> getAllStudentClasses(Pageable pageable) {
        return studentClassRepository.findAll(pageable);
    }

    public List<StudentClass> getStudentClassrooms(Integer studentId) {
        return studentClassRepository.findByStudentId(studentId);
    }

    public List<StudentClass> getClassroomStudents(Integer classroomId) {
        return studentClassRepository.findByClassroomId(classroomId);
    }

    @Transactional
    public void unenrollStudentFromClassroom(Integer id) {
        studentClassRepository.deleteById(id);
    }

    public boolean isStudentEnrolledInClassroom(Integer studentId, Integer classroomId) {
        return studentClassRepository.existsByStudentIdAndClassroomId(studentId, classroomId);
    }

    public long getEnrollmentCount() {
        return studentClassRepository.count();
    }
}
