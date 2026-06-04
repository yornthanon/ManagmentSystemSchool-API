package com.online.managamentsystemschool.service;

import com.online.managamentsystemschool.entity.Student;
import com.online.managamentsystemschool.entity.User;
import com.online.managamentsystemschool.repository.StudentRepository;
import com.online.managamentsystemschool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Student createStudent(Student student) {
        if (student.getUser() == null) {
            throw new RuntimeException("User information is required");
        }
        if (student.getUser().getPassword() != null) {
            student.getUser().setPassword(passwordEncoder.encode(student.getUser().getPassword()));
        }
        return studentRepository.save(student);
    }

    /**
     * Get student by ID
     */
    public Optional<Student> getStudentById(Integer id) {
        return studentRepository.findById(id);
    }

    /**
     * Get student by username
     */
    public Optional<Student> getStudentByUsername(String username) {
        List<Student> students = studentRepository.findByUserUsername(username);
        return students.isEmpty() ? Optional.empty() : Optional.of(students.get(0));
    }

    public Optional<Student> getStudentByEmail(String email) {
        return studentRepository.findByUserEmail(email);
    }

    /**
     * Get all students
     */
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Page<Student> getAllStudents(Pageable pageable) {
        return studentRepository.findAll(pageable);
    }

    @Transactional
    public Student updateStudent(Integer id, Student studentDetails) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        student.setGender(studentDetails.getGender());
        student.setDateOfBirth(studentDetails.getDateOfBirth());
        
        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Integer id) {
        studentRepository.deleteById(id);
    }

    /**
     * Get student count
     */
    public long getStudentCount() {
        return studentRepository.count();
    }

    @Transactional
    public Student updateStudentProfile(Integer studentId, String fullName, String email) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        User user = student.getUser();
        user.setFullName(fullName);
        user.setEmail(email);
        userRepository.save(user);
        
        return studentRepository.save(student);
    }
}

