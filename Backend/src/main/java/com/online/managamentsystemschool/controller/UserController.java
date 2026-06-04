package com.online.managamentsystemschool.controller;

import com.online.managamentsystemschool.dto.DTOMapper;
import com.online.managamentsystemschool.dto.request.CreateUserRequest;
import com.online.managamentsystemschool.dto.request.UpdateUserRequest;
import com.online.managamentsystemschool.dto.response.UserDTO;
import com.online.managamentsystemschool.entity.User;
import com.online.managamentsystemschool.entity.enums.Role;
import com.online.managamentsystemschool.service.UserService;
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
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            User user = DTOMapper.toUser(request);
            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(DTOMapper.toUserDTO(createdUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDTO>> getAllUsers(@PageableDefault(size = 20) Pageable pageable) {
        Page<UserDTO> users = userService.getAllUsers(pageable).map(DTOMapper::toUserDTO);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Integer id) {
        return userService.getUserById(id)
                .map(u -> ResponseEntity.ok(DTOMapper.toUserDTO(u)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username)
                .map(u -> ResponseEntity.ok(DTOMapper.toUserDTO(u)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(u -> ResponseEntity.ok(DTOMapper.toUserDTO(u)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Integer id, @Valid @RequestBody UpdateUserRequest request) {
        try {
            User userDetails = new User();
            userDetails.setFullName(request.getFullName());
            userDetails.setEmail(request.getEmail());
            userDetails.setRole(Role.fromString(request.getRole()));
            User updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(DTOMapper.toUserDTO(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/change-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> changePassword(@PathVariable Integer id, @RequestParam String newPassword) {
        try {
            userService.changePassword(id, newPassword);
            return ResponseEntity.ok("Password changed successfully");
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
