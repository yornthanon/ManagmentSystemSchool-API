package com.online.managamentsystemschool.presentation.controller;

import com.online.managamentsystemschool.presentation.dto.DTOMapper;
import com.online.managamentsystemschool.presentation.dto.request.CreateParentRequest;
import com.online.managamentsystemschool.presentation.dto.response.ParentDTO;
import com.online.managamentsystemschool.domain.model.Parent;
import com.online.managamentsystemschool.application.service.ParentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/parents")
@RequiredArgsConstructor
public class ParentController {
    private final ParentService parentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParentDTO> createParent(@Valid @RequestBody CreateParentRequest request) {
        try {
            Parent parent = new Parent();
            parent.setPhone(request.getPhone());
            Parent created = parentService.createParent(parent);
            return ResponseEntity.status(HttpStatus.CREATED).body(DTOMapper.toParentDTO(created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ParentDTO>> getAllParents(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(parentService.getAllParents(pageable).map(DTOMapper::toParentDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARENT')")
    public ResponseEntity<ParentDTO> getParentById(@PathVariable Integer id) {
        return parentService.getParentById(id)
                .map(p -> ResponseEntity.ok(DTOMapper.toParentDTO(p)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARENT')")
    public ResponseEntity<ParentDTO> getParentByUsername(@PathVariable String username) {
        return parentService.getParentByUsername(username)
                .map(p -> ResponseEntity.ok(DTOMapper.toParentDTO(p)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParentDTO> updateParent(@PathVariable Integer id, @RequestBody Parent parentDetails) {
        try {
            Parent updated = parentService.updateParent(id, parentDetails);
            return ResponseEntity.ok(DTOMapper.toParentDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteParent(@PathVariable Integer id) {
        try {
            parentService.deleteParent(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/profile")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARENT')")
    public ResponseEntity<ParentDTO> updateParentProfile(
            @PathVariable Integer id,
            @RequestParam String fullName,
            @RequestParam String email,
            @RequestParam String phone) {
        try {
            Parent updated = parentService.updateParentProfile(id, fullName, email, phone);
            return ResponseEntity.ok(DTOMapper.toParentDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
