package com.school.auth;

import com.school.auth.dto.LoginRequest;
import com.school.auth.dto.LoginResponse;
import com.school.auth.dto.UserResponse;
import com.school.user.User;
import com.school.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user;
        try {
            user = userService.getByEmail(request.email().trim());
        } catch (RuntimeException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, toUserResponse(user));
    }

    @Transactional(readOnly = true)
    public UserResponse me(Long userId) {
        User user = userService.getById(userId);
        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getRole());
    }
}
