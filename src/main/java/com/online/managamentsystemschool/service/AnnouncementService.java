package com.online.managamentsystemschool.service;

import com.online.managamentsystemschool.entity.Announcement;
import com.online.managamentsystemschool.entity.User;
import com.online.managamentsystemschool.repository.AnnouncementRepository;
import com.online.managamentsystemschool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final UserRepository userRepository;

    @Transactional
    public Announcement createAnnouncement(Announcement announcement) {
        if (announcement.getTitle() == null || announcement.getTitle().isEmpty()) {
            throw new RuntimeException("Announcement title is required");
        }
        return announcementRepository.save(announcement);
    }

    @Transactional
    public Announcement createAnnouncementByAuthor(String title, String content, Integer authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found"));

        Announcement announcement = new Announcement();
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setAuthor(author);
        announcement.setPublishedAt(LocalDateTime.now());

        return announcementRepository.save(announcement);
    }

    /**
     * Get announcement by ID
     */
    public Optional<Announcement> getAnnouncementById(Integer id) {
        return announcementRepository.findById(id);
    }

    /**
     * Get all announcements
     */
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public Page<Announcement> getAllAnnouncements(Pageable pageable) {
        return announcementRepository.findAll(pageable);
    }

    /**
     * Get announcements by author
     */
    public List<Announcement> getAnnouncementsByAuthor(Integer authorId) {
        return announcementRepository.findByAuthorId(authorId);
    }

    /**
     * Get announcements between dates
     */
    public List<Announcement> getAnnouncementsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return announcementRepository.findByPublishedAtBetween(startDate, endDate);
    }

    /**
     * Search announcements by title
     */
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

    /**
     * Get total announcements count
     */
    public long getAnnouncementCount() {
        return announcementRepository.count();
    }

    /**
     * Get recent announcements
     */
    public List<Announcement> getRecentAnnouncements(int limit) {
        return announcementRepository.findAllByOrderByPublishedAtDesc(PageRequest.of(0, limit));
    }
}

