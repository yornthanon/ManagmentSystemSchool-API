package com.online.managamentsystemschool.application.service;

import com.online.managamentsystemschool.application.port.AnnouncementRepository;
import com.online.managamentsystemschool.domain.model.Announcement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnnouncementService {
    private final AnnouncementRepository announcementRepository;

    @Transactional
    public Announcement createAnnouncement(Announcement announcement) {
        if (announcement.getTitle() == null || announcement.getTitle().isEmpty()) {
            throw new RuntimeException("Announcement title is required");
        }
        return announcementRepository.save(announcement);
    }

    @Transactional
    public Announcement createAnnouncementByAuthor(String title, String content, Integer authorId) {
        Announcement announcement = new Announcement();
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setAuthorId(authorId);
        announcement.setPublishedAt(java.time.LocalDateTime.now());
        return announcementRepository.save(announcement);
    }

    public Optional<Announcement> getAnnouncementById(Integer id) {
        return announcementRepository.findById(id);
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public Page<Announcement> getAllAnnouncements(Pageable pageable) {
        return announcementRepository.findAll(pageable);
    }

    public List<Announcement> getAnnouncementsByAuthor(Integer authorId) {
        return announcementRepository.findByAuthorId(authorId);
    }

    public List<Announcement> getAnnouncementsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return announcementRepository.findByPublishedAtBetween(startDate, endDate);
    }

    public List<Announcement> searchAnnouncementsByTitle(String title) {
        return announcementRepository.findByTitleContainingIgnoreCase(title);
    }

    @Transactional
    public Announcement updateAnnouncement(Integer id, String title, String content) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcement.setTitle(title);
        announcement.setContent(content);
        return announcementRepository.save(announcement);
    }

    @Transactional
    public void deleteAnnouncement(Integer id) {
        announcementRepository.deleteById(id);
    }

    public long getAnnouncementCount() {
        return announcementRepository.count();
    }

    public List<Announcement> getRecentAnnouncements(int limit) {
        return announcementRepository.findAllByOrderByPublishedAtDesc(PageRequest.of(0, limit)).getContent();
    }
}
