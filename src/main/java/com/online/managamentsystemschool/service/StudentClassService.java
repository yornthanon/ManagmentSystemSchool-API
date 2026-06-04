package com.online.managamentsystemschool.service;

import com.online.managamentsystemschool.entity.StudentClass;
import com.online.managamentsystemschool.entity.Student;
import com.online.managamentsystemschool.entity.Classroom;
import com.online.managamentsystemschool.repository.StudentClassRepository;
import com.online.managamentsystemschool.repository.StudentRepository;
import com.online.managamentsystemschool.repository.ClassroomRepository;
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
    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;

    @Transactional
    public StudentClass enrollStudentInClassroom(Integer studentId, Integer classroomId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        
        StudentClass studentClass = new StudentClass();
        studentClass.setStudent(student);
        studentClass.setClassroom(classroom);
        
        return studentClassRepository.save(studentClass);
    }

    /**
     * Get student-classroom by ID
     */
    public Optional<StudentClass> getStudentClassById(Integer id) {
        return studentClassRepository.findById(id);
    }

    /**
     * Get all student-classroom enrollments
     */
    public List<StudentClass> getAllStudentClasses() {
        return studentClassRepository.findAll();
    }

    public Page<StudentClass> getAllStudentClasses(Pageable pageable) {
        return studentClassRepository.findAll(pageable);
    }

    /**
     * Get classrooms for a student
     */
    public List<StudentClass> getStudentClassrooms(Integer studentId) {
        return studentClassRepository.findByStudentId(studentId);
    }

    /**
     * Get students in a classroom
     */
    public List<StudentClass> getClassroomStudents(Integer classroomId) {
        return studentClassRepository.findByClassroomId(classroomId);
    }

    @Transactional
    public void unenrollStudentFromClassroom(Integer id) {
        studentClassRepository.deleteById(id);
    }

    /**
     * Check if student is enrolled in classroom
     */
    public boolean isStudentEnrolledInClassroom(Integer studentId, Integer classroomId) {
        return studentClassRepository.existsByStudentIdAndClassroomId(studentId, classroomId);
    }

    /**
     * Get total enrollments
     */
    public long getEnrollmentCount() {
        return studentClassRepository.count();
    }
}

