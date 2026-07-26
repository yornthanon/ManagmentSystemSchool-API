package com.online.managamentsystemschool.infrastructure.persistence.mapper;

import com.online.managamentsystemschool.domain.model.User;
import com.online.managamentsystemschool.infrastructure.persistence.entity.UserEntity;

public class UserMapper {
    public static User toDomain(UserEntity entity) {
        if (entity == null) return null;
        return new User(entity.getId(), entity.getUsername(), entity.getPassword(),
                entity.getFullName(), entity.getEmail(), entity.getRole());
    }

    public static UserEntity toEntity(User domain) {
        if (domain == null) return null;
        UserEntity entity = new UserEntity();
        entity.setId(domain.getId());
        entity.setUsername(domain.getUsername());
        entity.setPassword(domain.getPassword());
        entity.setFullName(domain.getFullName());
        entity.setEmail(domain.getEmail());
        entity.setRole(domain.getRole());
        return entity;
    }
}
