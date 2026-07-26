package com.online.managamentsystemschool.infrastructure.config;

import com.online.managamentsystemschool.infrastructure.persistence.entity.UserEntity;
import com.online.managamentsystemschool.domain.enums.Role;
import com.online.managamentsystemschool.infrastructure.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataInitialize implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataInitialize.class);
    private final UserJpaRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        String password = adminPassword.isBlank() ? UUID.randomUUID().toString().substring(0, 12) : adminPassword;
        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
            UserEntity admin = new UserEntity();
            admin.setUsername("admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode(password));
            admin.setFullName("System Admin");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.info("Default admin created: admin@gmail.com / {}", password);
        } else if (!adminPassword.isBlank()) {
            UserEntity admin = userRepository.findByEmail("admin@gmail.com").get();
            admin.setPassword(passwordEncoder.encode(password));
            userRepository.save(admin);
            log.info("Admin password updated: admin@gmail.com / {}", password);
        } else {
            log.info("Admin already exists: admin@gmail.com (password unchanged)");
        }
    }
}
