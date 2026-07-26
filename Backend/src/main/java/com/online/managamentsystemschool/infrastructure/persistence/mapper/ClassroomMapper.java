package com.online.managamentsystemschool.infrastructure.persistence.mapper;

import com.online.managamentsystemschool.domain.model.Classroom;
import com.online.managamentsystemschool.infrastructure.persistence.entity.ClassroomEntity;

public class ClassroomMapper {
    public static Classroom toDomain(ClassroomEntity entity) {
        if (entity == null) return null;
        return new Classroom(entity.getId(), entity.getName(), entity.getGrade(), entity.getSchoolYear());
    }

    public static ClassroomEntity toEntity(Classroom domain) {
        if (domain == null) return null;
        ClassroomEntity entity = new ClassroomEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setGrade(domain.getGrade());
        entity.setSchoolYear(domain.getSchoolYear());
        return entity;
    }
}
