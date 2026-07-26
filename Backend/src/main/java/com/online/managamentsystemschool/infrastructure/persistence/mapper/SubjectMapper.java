package com.online.managamentsystemschool.infrastructure.persistence.mapper;

import com.online.managamentsystemschool.domain.model.Subject;
import com.online.managamentsystemschool.infrastructure.persistence.entity.SubjectEntity;

public class SubjectMapper {
    public static Subject toDomain(SubjectEntity entity) {
        if (entity == null) return null;
        return new Subject(entity.getId(), entity.getName(), entity.getDescription());
    }

    public static SubjectEntity toEntity(Subject domain) {
        if (domain == null) return null;
        SubjectEntity entity = new SubjectEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        return entity;
    }
}
