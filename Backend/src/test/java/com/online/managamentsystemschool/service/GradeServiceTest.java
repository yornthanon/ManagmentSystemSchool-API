package com.online.managamentsystemschool.service;

import com.online.managamentsystemschool.entity.Classroom;
import com.online.managamentsystemschool.entity.Grade;
import com.online.managamentsystemschool.entity.Student;
import com.online.managamentsystemschool.entity.Subject;
import com.online.managamentsystemschool.repository.ClassroomRepository;
import com.online.managamentsystemschool.repository.GradeRepository;
import com.online.managamentsystemschool.repository.StudentRepository;
import com.online.managamentsystemschool.repository.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GradeServiceTest {

    @Mock
    private GradeRepository gradeRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private ClassroomRepository classroomRepository;

    private GradeService gradeService;

    @BeforeEach
    void setUp() {
        gradeService = new GradeService(gradeRepository, studentRepository, subjectRepository, classroomRepository);
    }

    @Test
    void recordGrade_shouldSaveAndReturn() {
        Student student = new Student();
        student.setId(1);
        Subject subject = new Subject();
        subject.setId(1);
        Classroom classroom = new Classroom();
        classroom.setId(1);

        when(studentRepository.findById(1)).thenReturn(Optional.of(student));
        when(subjectRepository.findById(1)).thenReturn(Optional.of(subject));
        when(classroomRepository.findById(1)).thenReturn(Optional.of(classroom));
        when(gradeRepository.save(any(Grade.class))).thenAnswer(i -> i.getArgument(0));

        Grade result = gradeService.recordGrade(1, 1, 1, BigDecimal.valueOf(85.5));

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(85.5), result.getScore());
        assertEquals(student, result.getStudent());
        assertEquals(subject, result.getSubject());
        assertEquals(classroom, result.getClassroom());
    }

    @Test
    void getStudentAverageGrade_shouldCalculateCorrectly() {
        Grade g1 = new Grade(); g1.setScore(BigDecimal.valueOf(80));
        Grade g2 = new Grade(); g2.setScore(BigDecimal.valueOf(90));
        Grade g3 = new Grade(); g3.setScore(BigDecimal.valueOf(70));

        when(gradeRepository.findByStudentId(1)).thenReturn(List.of(g1, g2, g3));

        BigDecimal avg = gradeService.getStudentAverageGrade(1);

        assertEquals(new BigDecimal("80.00"), avg);
    }

    @Test
    void getStudentAverageGrade_shouldReturnZeroWhenNoGrades() {
        when(gradeRepository.findByStudentId(1)).thenReturn(List.of());

        BigDecimal avg = gradeService.getStudentAverageGrade(1);

        assertEquals(BigDecimal.ZERO, avg);
    }

    @Test
    void getGradeStatus_shouldReturnPass() {
        assertEquals("Pass", gradeService.getGradeStatus(BigDecimal.valueOf(50)));
        assertEquals("Pass", gradeService.getGradeStatus(BigDecimal.valueOf(75)));
    }

    @Test
    void getGradeStatus_shouldReturnFail() {
        assertEquals("Fail", gradeService.getGradeStatus(BigDecimal.valueOf(49)));
        assertEquals("Fail", gradeService.getGradeStatus(BigDecimal.valueOf(0)));
    }

    @Test
    void getGradeStatus_shouldReturnNAWhenNull() {
        assertEquals("N/A", gradeService.getGradeStatus(null));
    }

    @Test
    void deleteGrade_shouldCallRepository() {
        gradeService.deleteGrade(1);
        verify(gradeRepository).deleteById(1);
    }
}
