package com.online.managamentsystemschool.service;

import com.online.managamentsystemschool.entity.Parent;
import com.online.managamentsystemschool.entity.Student;
import com.online.managamentsystemschool.entity.User;
import com.online.managamentsystemschool.repository.ParentRepository;
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
public class ParentService {

    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Parent createParent(Parent parent) {
        if (parent.getUser() == null) {
            throw new RuntimeException("User information is required");
        }
        if (parent.getUser().getPassword() != null) {
            parent.getUser().setPassword(passwordEncoder.encode(parent.getUser().getPassword()));
        }
        return parentRepository.save(parent);
    }

    /**
     * Get parent by ID
     */
    public Optional<Parent> getParentById(Integer id) {
        return parentRepository.findById(id);
    }

    /**
     * Get parent by username
     */
    public Optional<Parent> getParentByUsername(String username) {
        List<Parent> parents = parentRepository.findByUserUsername(username);
        return parents.isEmpty() ? Optional.empty() : Optional.of(parents.get(0));
    }

    /**
     * Get all parents
     */
    public List<Parent> getAllParents() {
        return parentRepository.findAll();
    }

    public Page<Parent> getAllParents(Pageable pageable) {
        return parentRepository.findAll(pageable);
    }

    /**
     * Find parents by phone
     */
    public List<Parent> getParentsByPhone(String phone) {
        return parentRepository.findByPhone(phone);
    }

    @Transactional
    public Parent updateParent(Integer id, Parent parentDetails) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        
        parent.setPhone(parentDetails.getPhone());
        
        return parentRepository.save(parent);
    }

    @Transactional
    public void deleteParent(Integer id) {
        parentRepository.deleteById(id);
    }

    @Transactional
    public void linkStudentToParent(Integer parentId, Integer studentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (!parent.getStudents().contains(student)) {
            parent.getStudents().add(student);
            parentRepository.save(parent);
        }
    }

    @Transactional
    public void unlinkStudentFromParent(Integer parentId, Integer studentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        parent.getStudents().remove(student);
        parentRepository.save(parent);
    }

    /**
     * Get parent's children
     */
    public List<Student> getParentChildren(Integer parentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        return parent.getStudents();
    }

    @Transactional
    public Parent updateParentProfile(Integer parentId, String fullName, String email, String phone) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        
        User user = parent.getUser();
        user.setFullName(fullName);
        user.setEmail(email);
        userRepository.save(user);
        
        parent.setPhone(phone);
        return parentRepository.save(parent);
    }
}

