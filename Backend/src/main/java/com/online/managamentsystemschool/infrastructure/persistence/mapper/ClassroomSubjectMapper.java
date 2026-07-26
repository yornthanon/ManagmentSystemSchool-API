package com.online.managamentsystemschool.infrastructure.persistence.mapper;

import com.online.managamentsystemschool.domain.model.ClassroomSubject;
import com.online.managamentsystemschool.infrastructure.persistence.entity.ClassroomSubjectEntity;

public class ClassroomSubjectMapper {
    public static ClassroomSubject toDomain(ClassroomSubjectEntity entity) {
        if (entity == null) return null;
        Integer classroomId = entity.getClassroom() != null ? entity.getClassroom().getId() : null;
        Integer subjectId = entity.getSubject() != null ? entity.getSubject().getId() : null;
        Integer teacherId = entity.getTeacher() != null ? entity.getTeacher().getId() : null;
        return new ClassroomSubject(entity.getId(), classroomId, subjectId, teacherId);
    }

    public static ClassroomSubjectEntity toEntity(ClassroomSubject domain) {
        if (domain == null) return null;
        ClassroomSubjectEntity entity = new ClassroomSubjectEntity();
        entity.setId(domain.getId());
        return entity;
    }
}
