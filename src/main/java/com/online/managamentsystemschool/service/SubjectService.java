package com.online.managamentsystemschool.service;

import com.online.managamentsystemschool.entity.Subject;
import com.online.managamentsystemschool.repository.SubjectRepository;
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
public class SubjectService {

    private final SubjectRepository subjectRepository;

    @Transactional
    public Subject createSubject(Subject subject) {
        if (subject.getName() == null || subject.getName().isEmpty()) {
            throw new RuntimeException("Subject name is required");
        }
        return subjectRepository.save(subject);
    }

    /**
     * Get subject by ID
     */
    public Optional<Subject> getSubjectById(Integer id) {
        return subjectRepository.findById(id);
    }

    /**
     * Get all subjects
     */
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public Page<Subject> getAllSubjects(Pageable pageable) {
        return subjectRepository.findAll(pageable);
    }

    /**
     * Get subject by name (case-insensitive)
     */
    public Optional<Subject> getSubjectByName(String name) {
        Subject subject = subjectRepository.findByNameIgnoreCase(name);
        return Optional.ofNullable(subject);
    }

    /**
     * Search subjects by name
     */
    public List<Subject> searchSubjectsByName(String name) {
        return subjectRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional
    public Subject updateSubject(Integer id, Subject subjectDetails) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        
        subject.setName(subjectDetails.getName());
        subject.setDescription(subjectDetails.getDescription());
        
        return subjectRepository.save(subject);
    }

    @Transactional
    public void deleteSubject(Integer id) {
        subjectRepository.deleteById(id);
    }

    /**
     * Get total subjects count
     */
    public long getSubjectCount() {
        return subjectRepository.count();
    }
}

