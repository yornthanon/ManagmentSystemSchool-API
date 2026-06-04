package com.online.managamentsystemschool.service;

import com.online.managamentsystemschool.entity.Teacher;
import com.online.managamentsystemschool.entity.User;
import com.online.managamentsystemschool.repository.TeacherRepository;
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
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Teacher createTeacher(Teacher teacher) {
        if (teacher.getUser() == null) {
            throw new RuntimeException("User information is required");
        }
        if (teacher.getUser().getPassword() != null) {
            teacher.getUser().setPassword(passwordEncoder.encode(teacher.getUser().getPassword()));
        }
        return teacherRepository.save(teacher);
    }

    /**
     * Get teacher by ID
     */
    public Optional<Teacher> getTeacherById(Integer id) {
        return teacherRepository.findById(id);
    }

    /**
     * Get teacher by username
     */
    public Optional<Teacher> getTeacherByUsername(String username) {
        List<Teacher> teachers = teacherRepository.findByUserUsername(username);
        return teachers.isEmpty() ? Optional.empty() : Optional.of(teachers.get(0));
    }

    /**
     * Get all teachers
     */
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public Page<Teacher> getAllTeachers(Pageable pageable) {
        return teacherRepository.findAll(pageable);
    }

    /**
     * Find teachers by subject specialty
     */
    public List<Teacher> getTeachersBySubject(String subject) {
        return teacherRepository.findBySubjectSpecialtyContainingIgnoreCase(subject);
    }

    @Transactional
    public Teacher updateTeacher(Integer id, Teacher teacherDetails) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        teacher.setSubjectSpecialty(teacherDetails.getSubjectSpecialty());
        
        return teacherRepository.save(teacher);
    }

    @Transactional
    public void deleteTeacher(Integer id) {
        teacherRepository.deleteById(id);
    }

    /**
     * Get teacher count
     */
    public long getTeacherCount() {
        return teacherRepository.count();
    }

    @Transactional
    public Teacher updateTeacherProfile(Integer teacherId, String fullName, String email, String subject) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        User user = teacher.getUser();
        user.setFullName(fullName);
        user.setEmail(email);
        userRepository.save(user);
        
        teacher.setSubjectSpecialty(subject);
        return teacherRepository.save(teacher);
    }
}

