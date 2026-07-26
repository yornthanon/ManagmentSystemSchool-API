package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.infrastructure.persistence.entity.ClassroomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClassroomJpaRepository extends JpaRepository<ClassroomEntity, Integer> {
    List<ClassroomEntity> findByGrade(String grade);
    List<ClassroomEntity> findBySchoolYear(Integer schoolYear);
    List<ClassroomEntity> findByGradeAndSchoolYear(String grade, Integer schoolYear);

    @Query("SELECT COUNT(sc) FROM StudentClassEntity sc WHERE sc.classroom.id = :classroomId")
    long countStudentsByClassroomId(@Param("classroomId") Integer classroomId);
}
