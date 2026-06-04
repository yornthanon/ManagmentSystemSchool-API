package com.online.managamentsystemschool.repository;

import com.online.managamentsystemschool.entity.Announcement;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Integer> {
    List<Announcement> findByAuthorId(Integer authorId);
    List<Announcement> findByPublishedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Announcement> findByTitleContainingIgnoreCase(String title);
    List<Announcement> findAllByOrderByPublishedAtDesc(Pageable pageable);
}

