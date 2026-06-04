package com.online.managamentsystemschool.service;

import com.online.managamentsystemschool.entity.Grade;
import com.online.managamentsystemschool.entity.Student;
import com.online.managamentsystemschool.entity.Subject;
import com.online.managamentsystemschool.entity.Classroom;
import com.online.managamentsystemschool.repository.GradeRepository;
import com.online.managamentsystemschool.repository.StudentRepository;
import com.online.managamentsystemschool.repository.SubjectRepository;
import com.online.managamentsystemschool.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GradeService {

    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final ClassroomRepository classroomRepository;

    @Transactional
    public Grade recordGrade(Integer studentId, Integer subjectId, Integer classroomId, BigDecimal score) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        
        Grade grade = new Grade();
        grade.setStudent(student);
        grade.setSubject(subject);
        grade.setClassroom(classroom);
        grade.setScore(score);
        
        return gradeRepository.save(grade);
    }

    /**
     * Get grade by ID
     */
    public Optional<Grade> getGradeById(Integer id) {
        return gradeRepository.findById(id);
    }

    /**
     * Get all grades
     */
    public List<Grade> getAllGrades() {
        return gradeRepository.findAll();
    }

    public Page<Grade> getAllGrades(Pageable pageable) {
        return gradeRepository.findAll(pageable);
    }

    /**
     * Get grades for a student
     */
    public List<Grade> getStudentGrades(Integer studentId) {
        return gradeRepository.findByStudentId(studentId);
    }

    public List<Grade> getStudentGradesByEmail(String email) {
        return gradeRepository.findByStudentUserEmail(email);
    }

    /**
     * Get grades for a subject
     */
    public List<Grade> getSubjectGrades(Integer subjectId) {
        return gradeRepository.findBySubjectId(subjectId);
    }

    /**
     * Get grades in a classroom
     */
    public List<Grade> getClassroomGrades(Integer classroomId) {
        return gradeRepository.findByClassroomId(classroomId);
    }

    /**
     * Get grade for student-subject combination
     */
    public List<Grade> getStudentSubjectGrades(Integer studentId, Integer subjectId) {
        return gradeRepository.findByStudentIdAndSubjectId(studentId, subjectId);
    }

    /**
     * Get all grades for student in a classroom
     */
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

    /**
     * Calculate average grade for student
     */
    public BigDecimal getStudentAverageGrade(Integer studentId) {
        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        
        if (grades.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal sum = grades.stream()
                .map(Grade::getScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return sum.divide(BigDecimal.valueOf(grades.size()), 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate average grade for a subject
     */
    public BigDecimal getSubjectAverageGrade(Integer subjectId) {
        List<Grade> grades = gradeRepository.findBySubjectId(subjectId);
        
        if (grades.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal sum = grades.stream()
                .map(Grade::getScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return sum.divide(BigDecimal.valueOf(grades.size()), 2, RoundingMode.HALF_UP);
    }

    /**
     * Get grade status (Pass/Fail) based on score
     */
    public String getGradeStatus(BigDecimal score) {
        if (score == null) {
            return "N/A";
        }
        return score.compareTo(BigDecimal.valueOf(50)) >= 0 ? "Pass" : "Fail";
    }
}

