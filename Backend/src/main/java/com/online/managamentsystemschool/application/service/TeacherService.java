package com.online.managamentsystemschool.application.service;

import com.online.managamentsystemschool.application.port.TeacherRepository;
import com.online.managamentsystemschool.application.port.UserRepository;
import com.online.managamentsystemschool.domain.model.Teacher;
import com.online.managamentsystemschool.domain.model.User;
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
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;

    @Transactional
    public Teacher createTeacher(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    public Optional<Teacher> getTeacherById(Integer id) {
        return teacherRepository.findById(id);
    }

    public Optional<Teacher> getTeacherByUsername(String username) {
        List<Teacher> teachers = teacherRepository.findByUserUsername(username);
        return teachers.isEmpty() ? Optional.empty() : Optional.of(teachers.get(0));
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public Page<Teacher> getAllTeachers(Pageable pageable) {
        return teacherRepository.findAll(pageable);
    }

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

    public long getTeacherCount() {
        return teacherRepository.count();
    }

    @Transactional
    public Teacher updateTeacherProfile(Integer teacherId, String fullName, String email, String subject) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        Optional<User> userOpt = userRepository.findById(teacher.getUserId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFullName(fullName);
            user.setEmail(email);
            userRepository.save(user);
        }
        teacher.setSubjectSpecialty(subject);
        return teacherRepository.save(teacher);
    }
}
