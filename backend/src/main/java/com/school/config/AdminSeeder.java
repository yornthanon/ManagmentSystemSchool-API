package com.school.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.warn("ADMIN_EMAIL or ADMIN_PASSWORD is not set; skipping automatic admin seeding.");
            return;
        }

        Integer existing = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE email = ?",
                Integer.class,
                adminEmail
        );

        if (existing == null || existing == 0) {
            jdbcTemplate.update(
                    "INSERT INTO users (email, password, role, created_at, updated_at) VALUES (?, ?, 'ADMIN', NOW(), NOW())",
                    adminEmail,
                    passwordEncoder.encode(adminPassword)
            );
            log.info("Initial ADMIN account seeded for {}", adminEmail);
        } else {
            jdbcTemplate.update(
                    "UPDATE users SET password = ?, role = 'ADMIN', updated_at = NOW() WHERE email = ?",
                    passwordEncoder.encode(adminPassword),
                    adminEmail
            );
            log.info("ADMIN password updated for {}", adminEmail);
        }
    }
}
