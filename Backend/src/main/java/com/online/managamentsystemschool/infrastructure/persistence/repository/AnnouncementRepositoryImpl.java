package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.application.port.AnnouncementRepository;
import com.online.managamentsystemschool.domain.model.Announcement;
import com.online.managamentsystemschool.infrastructure.persistence.mapper.AnnouncementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AnnouncementRepositoryImpl implements AnnouncementRepository {
    private final AnnouncementJpaRepository jpaRepository;

    @Override
    public Optional<Announcement> findById(Integer id) {
        return jpaRepository.findById(id).map(AnnouncementMapper::toDomain);
    }

    @Override
    public List<Announcement> findByAuthorId(Integer authorId) {
        return jpaRepository.findByAuthorId(authorId).stream().map(AnnouncementMapper::toDomain).toList();
    }

    @Override
    public List<Announcement> findByPublishedAtBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return jpaRepository.findByPublishedAtBetween(startDate, endDate).stream().map(AnnouncementMapper::toDomain).toList();
    }

    @Override
    public List<Announcement> findByTitleContainingIgnoreCase(String title) {
        return jpaRepository.findByTitleContainingIgnoreCase(title).stream().map(AnnouncementMapper::toDomain).toList();
    }

    @Override
    public Page<Announcement> findAllByOrderByPublishedAtDesc(Pageable pageable) {
        return jpaRepository.findAllByOrderByPublishedAtDesc(pageable).map(AnnouncementMapper::toDomain);
    }

    @Override
    public Page<Announcement> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(AnnouncementMapper::toDomain);
    }

    @Override
    public List<Announcement> findAll() {
        return jpaRepository.findAll().stream().map(AnnouncementMapper::toDomain).toList();
    }

    @Override
    public Announcement save(Announcement announcement) {
        return AnnouncementMapper.toDomain(jpaRepository.save(AnnouncementMapper.toEntity(announcement)));
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public long count() {
        return jpaRepository.count();
    }
}
