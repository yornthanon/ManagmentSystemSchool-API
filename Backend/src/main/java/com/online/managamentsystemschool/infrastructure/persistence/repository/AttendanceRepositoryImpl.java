package com.online.managamentsystemschool.infrastructure.persistence.repository;

import com.online.managamentsystemschool.application.port.AttendanceRepository;
import com.online.managamentsystemschool.domain.model.Attendance;
import com.online.managamentsystemschool.infrastructure.persistence.mapper.AttendanceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AttendanceRepositoryImpl implements AttendanceRepository {
    private final AttendanceJpaRepository jpaRepository;

    @Override
    public Optional<Attendance> findById(Integer id) {
        return jpaRepository.findById(id).map(AttendanceMapper::toDomain);
    }

    @Override
    public List<Attendance> findByStudentId(Integer studentId) {
        return jpaRepository.findByStudentId(studentId).stream().map(AttendanceMapper::toDomain).toList();
    }

    @Override
    public List<Attendance> findByClassroomId(Integer classroomId) {
        return jpaRepository.findByClassroomId(classroomId).stream().map(AttendanceMapper::toDomain).toList();
    }

    @Override
    public List<Attendance> findByStudentIdAndDate(Integer studentId, LocalDate date) {
        return jpaRepository.findByStudentIdAndDate(studentId, date).stream().map(AttendanceMapper::toDomain).toList();
    }

    @Override
    public List<Attendance> findByClassroomIdAndDate(Integer classroomId, LocalDate date) {
        return jpaRepository.findByClassroomIdAndDate(classroomId, date).stream().map(AttendanceMapper::toDomain).toList();
    }

    @Override
    public List<Attendance> findByStudentIdAndClassroomIdAndDateBetween(Integer studentId, Integer classroomId, LocalDate startDate, LocalDate endDate) {
        return jpaRepository.findByStudentIdAndClassroomIdAndDateBetween(studentId, classroomId, startDate, endDate).stream().map(AttendanceMapper::toDomain).toList();
    }

    @Override
    public List<Attendance> findByStudentUserEmail(String email) {
        return jpaRepository.findByStudentUserEmail(email).stream().map(AttendanceMapper::toDomain).toList();
    }

    @Override
    public Page<Attendance> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(AttendanceMapper::toDomain);
    }

    @Override
    public List<Attendance> findAll() {
        return jpaRepository.findAll().stream().map(AttendanceMapper::toDomain).toList();
    }

    @Override
    public Attendance save(Attendance attendance) {
        return AttendanceMapper.toDomain(jpaRepository.save(AttendanceMapper.toEntity(attendance)));
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }
}
