package com.school.classroom;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ClassroomService {

    private final ClassroomRepository classroomRepository;

    public ClassroomService(ClassroomRepository classroomRepository) {
        this.classroomRepository = classroomRepository;
    }

    public List<Classroom> findAll() {
        return classroomRepository.findAll();
    }

    public Optional<Classroom> findById(Long id) {
        return classroomRepository.findById(id);
    }

    @Transactional
    public Classroom create(Classroom classroom) {
        return classroomRepository.save(classroom);
    }

    @Transactional
    public Classroom update(Long id, Classroom classroomDetails) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found: " + id));
        classroom.setName(classroomDetails.getName());
        classroom.setGrade(classroomDetails.getGrade());
        classroom.setAcademicYear(classroomDetails.getAcademicYear());
        classroom.setRoomNumber(classroomDetails.getRoomNumber());
        classroom.setCapacity(classroomDetails.getCapacity());
        return classroomRepository.save(classroom);
    }

    @Transactional
    public void delete(Long id) {
        classroomRepository.deleteById(id);
    }
}
