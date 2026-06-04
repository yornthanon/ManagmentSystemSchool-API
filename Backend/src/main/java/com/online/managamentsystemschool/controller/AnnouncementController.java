package com.online.managamentsystemschool.controller;

import com.online.managamentsystemschool.dto.DTOMapper;
import com.online.managamentsystemschool.dto.response.AnnouncementDTO;
import com.online.managamentsystemschool.entity.Announcement;
import com.online.managamentsystemschool.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<AnnouncementDTO> createAnnouncement(@Valid @RequestBody Announcement announcement) {
        try {
            Announcement created = announcementService.createAnnouncement(announcement);
            return ResponseEntity.status(HttpStatus.CREATED).body(DTOMapper.toAnnouncementDTO(created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<AnnouncementDTO> createAnnouncementByAuthor(
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam Integer authorId) {
        try {
            Announcement announcement = announcementService.createAnnouncementByAuthor(title, content, authorId);
            return ResponseEntity.status(HttpStatus.CREATED).body(DTOMapper.toAnnouncementDTO(announcement));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<Page<AnnouncementDTO>> getAllAnnouncements(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(announcementService.getAllAnnouncements(pageable).map(DTOMapper::toAnnouncementDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<AnnouncementDTO> getAnnouncementById(@PathVariable Integer id) {
        return announcementService.getAnnouncementById(id)
                .map(a -> ResponseEntity.ok(DTOMapper.toAnnouncementDTO(a)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/author/{authorId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AnnouncementDTO>> getAnnouncementsByAuthor(@PathVariable Integer authorId) {
        return ResponseEntity.ok(
                DTOMapper.toAnnouncementDTOList(announcementService.getAnnouncementsByAuthor(authorId)));
    }

    @GetMapping("/date-range")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AnnouncementDTO>> getAnnouncementsBetweenDates(
            @RequestParam LocalDateTime startDate, @RequestParam LocalDateTime endDate) {
        return ResponseEntity.ok(
                DTOMapper.toAnnouncementDTOList(
                        announcementService.getAnnouncementsBetweenDates(startDate, endDate)));
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AnnouncementDTO>> searchAnnouncementsByTitle(@RequestParam String title) {
        return ResponseEntity.ok(
                DTOMapper.toAnnouncementDTOList(announcementService.searchAnnouncementsByTitle(title)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<AnnouncementDTO> updateAnnouncement(
            @PathVariable Integer id,
            @RequestParam String title,
            @RequestParam String content) {
        try {
            Announcement updated = announcementService.updateAnnouncement(id, title, content);
            return ResponseEntity.ok(DTOMapper.toAnnouncementDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Integer id) {
        try {
            announcementService.deleteAnnouncement(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getAnnouncementCount() {
        return ResponseEntity.ok(announcementService.getAnnouncementCount());
    }

    @GetMapping("/recent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AnnouncementDTO>> getRecentAnnouncements(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(
                DTOMapper.toAnnouncementDTOList(announcementService.getRecentAnnouncements(limit)));
    }
}
