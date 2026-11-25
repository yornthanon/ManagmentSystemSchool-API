package com.school.subject;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public List<Subject> findAll() {
        return subjectRepository.findAll();
    }

    public Optional<Subject> findById(Long id) {
        return subjectRepository.findById(id);
    }

    @Transactional
    public Subject create(Subject subject) {
        return subjectRepository.save(subject);
    }

    @Transactional
    public Subject update(Long id, Subject subjectDetails) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + id));
        subject.setCode(subjectDetails.getCode());
        subject.setName(subjectDetails.getName());
        subject.setDepartment(subjectDetails.getDepartment());
        return subjectRepository.save(subject);
    }

    @Transactional
    public void delete(Long id) {
        subjectRepository.deleteById(id);
    }
}
