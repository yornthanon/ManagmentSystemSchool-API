package com.online.managamentsystemschool.application.service;

import com.online.managamentsystemschool.application.port.ParentRepository;
import com.online.managamentsystemschool.application.port.StudentRepository;
import com.online.managamentsystemschool.application.port.UserRepository;
import com.online.managamentsystemschool.domain.model.Parent;
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
public class ParentService {
    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    @Transactional
    public Parent createParent(Parent parent) {
        return parentRepository.save(parent);
    }

    public Optional<Parent> getParentById(Integer id) {
        return parentRepository.findById(id);
    }

    public Optional<Parent> getParentByUsername(String username) {
        List<Parent> parents = parentRepository.findByUserUsername(username);
        return parents.isEmpty() ? Optional.empty() : Optional.of(parents.get(0));
    }

    public List<Parent> getAllParents() {
        return parentRepository.findAll();
    }

    public Page<Parent> getAllParents(Pageable pageable) {
        return parentRepository.findAll(pageable);
    }

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
    public Parent updateParentProfile(Integer parentId, String fullName, String email, String phone) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        Optional<User> userOpt = userRepository.findById(parent.getUserId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFullName(fullName);
            user.setEmail(email);
            userRepository.save(user);
        }
        parent.setPhone(phone);
        return parentRepository.save(parent);
    }
}
