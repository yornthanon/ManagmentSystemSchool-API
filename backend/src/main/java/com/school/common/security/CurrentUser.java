package com.school.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public record CurrentUser(Long userId, String email, String role) {

    public static CurrentUser get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CurrentUser principal)) {
            throw new IllegalStateException("No authenticated user in security context");
        }
        return principal;
    }

    public static Long id() {
        return get().userId();
    }
}
