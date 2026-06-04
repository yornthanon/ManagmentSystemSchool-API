package com.online.managamentsystemschool.repository;

import com.online.managamentsystemschool.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Integer> {
    List<Classroom> findByGrade(String grade);
    List<Classroom> findBySchoolYear(Integer schoolYear);
    List<Classroom> findByGradeAndSchoolYear(String grade, Integer schoolYear);

    @Query("SELECT COUNT(sc) FROM StudentClass sc WHERE sc.classroom.id = :classroomId")
    long countStudentsByClassroomId(@Param("classroomId") Integer classroomId);
}

