package com.online.managamentsystemschool.repository;

import com.online.managamentsystemschool.entity.StudentClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentClassRepository extends JpaRepository<StudentClass, Integer> {
    List<StudentClass> findByStudentId(Integer studentId);
    List<StudentClass> findByClassroomId(Integer classroomId);
    boolean existsByStudentIdAndClassroomId(Integer studentId, Integer classroomId);
}

