package com.online.managamentsystemschool.presentation.controller;

import com.online.managamentsystemschool.presentation.dto.DTOMapper;
import com.online.managamentsystemschool.presentation.dto.request.LoginRequest;
import com.online.managamentsystemschool.presentation.dto.response.LoginResponse;
import com.online.managamentsystemschool.presentation.dto.response.UserDTO;
import com.online.managamentsystemschool.domain.model.User;
import com.online.managamentsystemschool.domain.enums.Role;
import com.online.managamentsystemschool.application.port.UserRepository;
import com.online.managamentsystemschool.infrastructure.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .or(() -> userRepository.findByUsername(request.getEmail()))
                    .orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid email or username"));
            }
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid password"));
            }
            String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().toString());
            UserDTO userDTO = DTOMapper.toUserDTO(user);
            return ResponseEntity.ok(new LoginResponse(token, userDTO));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Email already registered"));
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().toString());
        UserDTO userDTO = DTOMapper.toUserDTO(savedUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(new LoginResponse(token, userDTO));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid token format"));
        }
        String jwt = token.substring(7);
        if (jwtTokenProvider.validateToken(jwt)) {
            String email = jwtTokenProvider.getEmailFromToken(jwt);
            String role = jwtTokenProvider.getRoleFromToken(jwt);
            return ResponseEntity.ok(new TokenValidationResponse(true, email, role));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid token"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid token format"));
        }
        String jwt = token.substring(7);
        if (jwtTokenProvider.validateToken(jwt)) {
            String email = jwtTokenProvider.getEmailFromToken(jwt);
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(DTOMapper.toUserDTO(user));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Unauthorized"));
    }

    @Data
    public static class RegisterRequest {
        public String username;
        public String email;
        public String password;
        public String fullName;
    }

    @Data
    public static class ErrorResponse {
        public String message;
        public ErrorResponse(String message) { this.message = message; }
    }

    @Data
    public static class MessageResponse {
        public String message;
        public MessageResponse(String message) { this.message = message; }
    }

    @Data
    public static class TokenValidationResponse {
        public Boolean valid;
        public String email;
        public String role;
        public TokenValidationResponse(Boolean valid, String email, String role) {
            this.valid = valid;
            this.email = email;
            this.role = role;
        }
    }
}
