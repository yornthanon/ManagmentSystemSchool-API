package com.online.managamentsystemschool.application.service;

import com.online.managamentsystemschool.application.port.GradeRepository;
import com.online.managamentsystemschool.domain.model.Grade;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GradeService {
    private final GradeRepository gradeRepository;

    @Transactional
    public Grade recordGrade(Grade grade) {
        return gradeRepository.save(grade);
    }

    public Optional<Grade> getGradeById(Integer id) {
        return gradeRepository.findById(id);
    }

    public List<Grade> getAllGrades() {
        return gradeRepository.findAll();
    }

    public Page<Grade> getAllGrades(Pageable pageable) {
        return gradeRepository.findAll(pageable);
    }

    public List<Grade> getStudentGrades(Integer studentId) {
        return gradeRepository.findByStudentId(studentId);
    }

    public List<Grade> getStudentGradesByEmail(String email) {
        return gradeRepository.findByStudentUserEmail(email);
    }

    public List<Grade> getSubjectGrades(Integer subjectId) {
        return gradeRepository.findBySubjectId(subjectId);
    }

    public List<Grade> getClassroomGrades(Integer classroomId) {
        return gradeRepository.findByClassroomId(classroomId);
    }

    public List<Grade> getStudentSubjectGrades(Integer studentId, Integer subjectId) {
        return gradeRepository.findByStudentIdAndSubjectId(studentId, subjectId);
    }

    public List<Grade> getStudentClassroomGrades(Integer studentId, Integer classroomId) {
        return gradeRepository.findByStudentIdAndClassroomId(studentId, classroomId);
    }

    @Transactional
    public Grade updateGrade(Integer id, BigDecimal score) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grade not found"));
        grade.setScore(score);
        return gradeRepository.save(grade);
    }

    @Transactional
    public void deleteGrade(Integer id) {
        gradeRepository.deleteById(id);
    }

    public BigDecimal getStudentAverageGrade(Integer studentId) {
        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        if (grades.isEmpty()) return BigDecimal.ZERO;
        BigDecimal sum = grades.stream().map(Grade::getScore).reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(grades.size()), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal getSubjectAverageGrade(Integer subjectId) {
        List<Grade> grades = gradeRepository.findBySubjectId(subjectId);
        if (grades.isEmpty()) return BigDecimal.ZERO;
        BigDecimal sum = grades.stream().map(Grade::getScore).reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(grades.size()), 2, RoundingMode.HALF_UP);
    }

    public String getGradeStatus(BigDecimal score) {
        if (score == null) return "N/A";
        return score.compareTo(BigDecimal.valueOf(50)) >= 0 ? "Pass" : "Fail";
    }
}
