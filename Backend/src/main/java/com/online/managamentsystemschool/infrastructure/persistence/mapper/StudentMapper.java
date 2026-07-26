package com.online.managamentsystemschool.infrastructure.persistence.mapper;

import com.online.managamentsystemschool.domain.model.Student;
import com.online.managamentsystemschool.infrastructure.persistence.entity.StudentEntity;

public class StudentMapper {
    public static Student toDomain(StudentEntity entity) {
        if (entity == null) return null;
        Integer userId = entity.getUser() != null ? entity.getUser().getId() : null;
        return new Student(entity.getId(), userId, entity.getGender(), entity.getDateOfBirth());
    }

    public static StudentEntity toEntity(Student domain) {
        if (domain == null) return null;
        StudentEntity entity = new StudentEntity();
        entity.setId(domain.getId());
        entity.setGender(domain.getGender());
        entity.setDateOfBirth(domain.getDateOfBirth());
        return entity;
    }
}
