package com.online.managamentsystemschool.infrastructure.persistence.mapper;

import com.online.managamentsystemschool.domain.model.Grade;
import com.online.managamentsystemschool.infrastructure.persistence.entity.GradeEntity;

public class GradeMapper {
    public static Grade toDomain(GradeEntity entity) {
        if (entity == null) return null;
        Integer studentId = entity.getStudent() != null ? entity.getStudent().getId() : null;
        Integer subjectId = entity.getSubject() != null ? entity.getSubject().getId() : null;
        Integer classroomId = entity.getClassroom() != null ? entity.getClassroom().getId() : null;
        return new Grade(entity.getId(), studentId, subjectId, classroomId, entity.getScore());
    }

    public static GradeEntity toEntity(Grade domain) {
        if (domain == null) return null;
        GradeEntity entity = new GradeEntity();
        entity.setId(domain.getId());
        entity.setScore(domain.getScore());
        return entity;
    }
}
