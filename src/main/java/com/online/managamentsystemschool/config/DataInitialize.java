package com.online.managamentsystemschool.config;

import com.online.managamentsystemschool.entity.User;
import com.online.managamentsystemschool.entity.enums.Role;
import com.online.managamentsystemschool.repository.UserRepository;
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

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
            String password = adminPassword.isBlank() ? UUID.randomUUID().toString().substring(0, 12) : adminPassword;

            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode(password));
            admin.setFullName("System Admin");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.info("Default admin created: admin@gmail.com / {}", password);
        }
    }
}
