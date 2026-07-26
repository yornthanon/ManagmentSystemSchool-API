package com.online.managamentsystemschool.infrastructure.persistence.mapper;

import com.online.managamentsystemschool.domain.model.StudentClass;
import com.online.managamentsystemschool.infrastructure.persistence.entity.StudentClassEntity;

public class StudentClassMapper {
    public static StudentClass toDomain(StudentClassEntity entity) {
        if (entity == null) return null;
        Integer studentId = entity.getStudent() != null ? entity.getStudent().getId() : null;
        Integer classroomId = entity.getClassroom() != null ? entity.getClassroom().getId() : null;
        return new StudentClass(entity.getId(), studentId, classroomId);
    }

    public static StudentClassEntity toEntity(StudentClass domain) {
        if (domain == null) return null;
        StudentClassEntity entity = new StudentClassEntity();
        entity.setId(domain.getId());
        return entity;
    }
}
