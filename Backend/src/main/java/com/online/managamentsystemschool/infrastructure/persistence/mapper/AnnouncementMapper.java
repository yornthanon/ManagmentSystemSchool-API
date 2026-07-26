package com.online.managamentsystemschool.infrastructure.persistence.mapper;

import com.online.managamentsystemschool.domain.model.Announcement;
import com.online.managamentsystemschool.infrastructure.persistence.entity.AnnouncementEntity;

public class AnnouncementMapper {
    public static Announcement toDomain(AnnouncementEntity entity) {
        if (entity == null) return null;
        Integer authorId = entity.getAuthor() != null ? entity.getAuthor().getId() : null;
        return new Announcement(entity.getId(), entity.getTitle(), entity.getContent(),
                entity.getPublishedAt(), authorId);
    }

    public static AnnouncementEntity toEntity(Announcement domain) {
        if (domain == null) return null;
        AnnouncementEntity entity = new AnnouncementEntity();
        entity.setId(domain.getId());
        entity.setTitle(domain.getTitle());
        entity.setContent(domain.getContent());
        entity.setPublishedAt(domain.getPublishedAt());
        return entity;
    }
}
