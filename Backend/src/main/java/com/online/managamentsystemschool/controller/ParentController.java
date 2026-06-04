package com.online.managamentsystemschool.controller;

import com.online.managamentsystemschool.dto.DTOMapper;
import com.online.managamentsystemschool.dto.request.CreateParentRequest;
import com.online.managamentsystemschool.dto.response.ParentDTO;
import com.online.managamentsystemschool.dto.response.StudentDTO;
import com.online.managamentsystemschool.entity.Parent;
import com.online.managamentsystemschool.entity.User;
import com.online.managamentsystemschool.entity.enums.Role;
import com.online.managamentsystemschool.service.ParentService;
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
@RequestMapping("/parents")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParentDTO> createParent(@Valid @RequestBody CreateParentRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setPassword(request.getPassword());
            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
             user.setRole(Role.PARENT);

            Parent parent = new Parent();
            parent.setUser(user);
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

    @GetMapping("/phone/{phone}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ParentDTO>> getParentsByPhone(@PathVariable String phone) {
        return ResponseEntity.ok(DTOMapper.toParentDTOList(parentService.getParentsByPhone(phone)));
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

    @PostMapping("/{parentId}/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARENT')")
    public ResponseEntity<String> linkStudentToParent(@PathVariable Integer parentId, @PathVariable Integer studentId) {
        try {
            parentService.linkStudentToParent(parentId, studentId);
            return ResponseEntity.ok("Student linked to parent successfully");
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{parentId}/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARENT')")
    public ResponseEntity<Void> unlinkStudentFromParent(@PathVariable Integer parentId, @PathVariable Integer studentId) {
        try {
            parentService.unlinkStudentFromParent(parentId, studentId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{parentId}/students")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARENT')")
    public ResponseEntity<List<StudentDTO>> getParentChildren(@PathVariable Integer parentId) {
        try {
            return ResponseEntity.ok(DTOMapper.toStudentDTOList(parentService.getParentChildren(parentId)));
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
