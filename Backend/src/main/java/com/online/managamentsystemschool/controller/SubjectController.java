package com.online.managamentsystemschool.controller;

import com.online.managamentsystemschool.dto.DTOMapper;
import com.online.managamentsystemschool.dto.request.CreateSubjectRequest;
import com.online.managamentsystemschool.dto.response.SubjectDTO;
import com.online.managamentsystemschool.entity.Subject;
import com.online.managamentsystemschool.service.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubjectDTO> createSubject(@Valid @RequestBody CreateSubjectRequest request) {
        try {
            Subject subject = new Subject();
            subject.setName(request.getName());
            subject.setDescription(request.getDescription());

            Subject created = subjectService.createSubject(subject);
            return ResponseEntity.status(HttpStatus.CREATED).body(DTOMapper.toSubjectDTO(created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<SubjectDTO>> getAllSubjects(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(subjectService.getAllSubjects(pageable).map(DTOMapper::toSubjectDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Integer id) {
        return subjectService.getSubjectById(id)
                .map(s -> ResponseEntity.ok(DTOMapper.toSubjectDTO(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubjectDTO> getSubjectByName(@PathVariable String name) {
        return subjectService.getSubjectByName(name)
                .map(s -> ResponseEntity.ok(DTOMapper.toSubjectDTO(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SubjectDTO>> searchSubjectsByName(@RequestParam String name) {
        return ResponseEntity.ok(DTOMapper.toSubjectDTOList(subjectService.searchSubjectsByName(name)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubjectDTO> updateSubject(@PathVariable Integer id, @RequestBody Subject subjectDetails) {
        try {
            Subject updated = subjectService.updateSubject(id, subjectDetails);
            return ResponseEntity.ok(DTOMapper.toSubjectDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSubject(@PathVariable Integer id) {
        try {
            subjectService.deleteSubject(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getSubjectCount() {
        return ResponseEntity.ok(subjectService.getSubjectCount());
    }
}
