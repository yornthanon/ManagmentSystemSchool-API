package com.school.auth.dto;

import com.school.user.Role;

public record UserResponse(
        Long id,
        String email,
        Role role
) {
}
