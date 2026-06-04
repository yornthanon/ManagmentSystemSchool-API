package com.online.managamentsystemschool.service;

import com.online.managamentsystemschool.entity.Classroom;
import com.online.managamentsystemschool.repository.ClassroomRepository;
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
public class ClassroomService {

    private final ClassroomRepository classroomRepository;

    @Transactional
    public Classroom createClassroom(Classroom classroom) {
        if (classroom.getName() == null || classroom.getName().isEmpty()) {
            throw new RuntimeException("Classroom name is required");
        }
        return classroomRepository.save(classroom);
    }

    /**
     * Get classroom by ID
     */
    public Optional<Classroom> getClassroomById(Integer id) {
        return classroomRepository.findById(id);
    }

    /**
     * Get all classrooms
     */
    public List<Classroom> getAllClassrooms() {
        return classroomRepository.findAll();
    }

    public Page<Classroom> getAllClassrooms(Pageable pageable) {
        return classroomRepository.findAll(pageable);
    }

    /**
     * Get classrooms by grade
     */
    public List<Classroom> getClassroomsByGrade(String grade) {
        return classroomRepository.findByGrade(grade);
    }

    /**
     * Get classrooms by school year
     */
    public List<Classroom> getClassroomsBySchoolYear(Integer schoolYear) {
        return classroomRepository.findBySchoolYear(schoolYear);
    }

    /**
     * Get classrooms by grade and school year
     */
    public List<Classroom> getClassroomsByGradeAndYear(String grade, Integer schoolYear) {
        return classroomRepository.findByGradeAndSchoolYear(grade, schoolYear);
    }

    @Transactional
    public Classroom updateClassroom(Integer id, Classroom classroomDetails) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        
        classroom.setName(classroomDetails.getName());
        classroom.setGrade(classroomDetails.getGrade());
        classroom.setSchoolYear(classroomDetails.getSchoolYear());
        
        return classroomRepository.save(classroom);
    }

    @Transactional
    public void deleteClassroom(Integer id) {
        classroomRepository.deleteById(id);
    }

    /**
     * Get total classrooms count
     */
    public long getClassroomCount() {
        return classroomRepository.count();
    }

    /**
     * Get student count in classroom
     */
    public long getStudentCountInClassroom(Integer classroomId) {
        return classroomRepository.countStudentsByClassroomId(classroomId);
    }
}

