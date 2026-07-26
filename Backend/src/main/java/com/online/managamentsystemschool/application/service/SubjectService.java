package com.online.managamentsystemschool.application.service;

import com.online.managamentsystemschool.application.port.SubjectRepository;
import com.online.managamentsystemschool.domain.model.Subject;
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

    public Optional<Subject> getSubjectById(Integer id) {
        return subjectRepository.findById(id);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public Page<Subject> getAllSubjects(Pageable pageable) {
        return subjectRepository.findAll(pageable);
    }

    public Optional<Subject> getSubjectByName(String name) {
        return subjectRepository.findByNameIgnoreCase(name);
    }

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

    public long getSubjectCount() {
        return subjectRepository.count();
    }
}
