package com.online.managamentsystemschool.infrastructure.persistence.mapper;

import com.online.managamentsystemschool.domain.model.Teacher;
import com.online.managamentsystemschool.infrastructure.persistence.entity.TeacherEntity;

public class TeacherMapper {
    public static Teacher toDomain(TeacherEntity entity) {
        if (entity == null) return null;
        Integer userId = entity.getUser() != null ? entity.getUser().getId() : null;
        return new Teacher(entity.getId(), userId, entity.getSubjectSpecialty());
    }

    public static TeacherEntity toEntity(Teacher domain) {
        if (domain == null) return null;
        TeacherEntity entity = new TeacherEntity();
        entity.setId(domain.getId());
        entity.setSubjectSpecialty(domain.getSubjectSpecialty());
        return entity;
    }
}
