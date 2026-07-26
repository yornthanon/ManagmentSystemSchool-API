package com.online.managamentsystemschool.application.port;

import com.online.managamentsystemschool.domain.model.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AnnouncementRepository {
    Optional<Announcement> findById(Integer id);
    List<Announcement> findByAuthorId(Integer authorId);
    List<Announcement> findByPublishedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Announcement> findByTitleContainingIgnoreCase(String title);
    Page<Announcement> findAllByOrderByPublishedAtDesc(Pageable pageable);
    Page<Announcement> findAll(Pageable pageable);
    List<Announcement> findAll();
    Announcement save(Announcement announcement);
    void deleteById(Integer id);
    long count();
}
