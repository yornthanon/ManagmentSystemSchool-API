package com.online.managamentsystemschool.infrastructure.persistence.mapper;

import com.online.managamentsystemschool.domain.model.Parent;
import com.online.managamentsystemschool.infrastructure.persistence.entity.ParentEntity;

import java.util.Collections;
import java.util.stream.Collectors;

public class ParentMapper {
    public static Parent toDomain(ParentEntity entity) {
        if (entity == null) return null;
        Integer userId = entity.getUser() != null ? entity.getUser().getId() : null;
        var studentIds = entity.getStudents() != null
            ? entity.getStudents().stream().map(s -> s.getId()).collect(Collectors.toList())
            : Collections.<Integer>emptyList();
        return new Parent(entity.getId(), userId, entity.getPhone(), studentIds);
    }

    public static ParentEntity toEntity(Parent domain) {
        if (domain == null) return null;
        ParentEntity entity = new ParentEntity();
        entity.setId(domain.getId());
        entity.setPhone(domain.getPhone());
        return entity;
    }
}
