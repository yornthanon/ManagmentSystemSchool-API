package com.school.auth.dto;

public record LoginResponse(
        String token,
        UserResponse user
) {
}
