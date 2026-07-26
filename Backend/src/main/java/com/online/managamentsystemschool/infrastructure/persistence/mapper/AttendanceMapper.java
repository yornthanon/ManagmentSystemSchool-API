package com.online.managamentsystemschool.infrastructure.persistence.mapper;

import com.online.managamentsystemschool.domain.model.Attendance;
import com.online.managamentsystemschool.infrastructure.persistence.entity.AttendanceEntity;

public class AttendanceMapper {
    public static Attendance toDomain(AttendanceEntity entity) {
        if (entity == null) return null;
        Integer studentId = entity.getStudent() != null ? entity.getStudent().getId() : null;
        Integer classroomId = entity.getClassroom() != null ? entity.getClassroom().getId() : null;
        return new Attendance(entity.getId(), studentId, classroomId, entity.getDate(), entity.getStatus());
    }

    public static AttendanceEntity toEntity(Attendance domain) {
        if (domain == null) return null;
        AttendanceEntity entity = new AttendanceEntity();
        entity.setId(domain.getId());
        entity.setDate(domain.getDate());
        entity.setStatus(domain.getStatus());
        return entity;
    }
}
