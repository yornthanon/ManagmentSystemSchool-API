package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.infrastructure.persistence.entity.AnnouncementEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AnnouncementJpaRepository extends JpaRepository<AnnouncementEntity, Integer> {
    List<AnnouncementEntity> findByAuthorId(Integer authorId);
    List<AnnouncementEntity> findByPublishedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<AnnouncementEntity> findByTitleContainingIgnoreCase(String title);
    Page<AnnouncementEntity> findAllByOrderByPublishedAtDesc(Pageable pageable);
}
