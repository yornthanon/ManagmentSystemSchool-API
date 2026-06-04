package com.online.managamentsystemschool.service;

import com.online.managamentsystemschool.entity.User;
import com.online.managamentsystemschool.entity.enums.Role;
import com.online.managamentsystemschool.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void createUser_shouldEncodePasswordAndSave() {
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("rawPassword");
        user.setRole(Role.ADMIN);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = userService.createUser(user);

        assertNotNull(result);
        assertNotEquals("rawPassword", result.getPassword());
        assertTrue(passwordEncoder.matches("rawPassword", result.getPassword()));
        verify(userRepository).save(user);
    }

    @Test
    void createUser_shouldThrowWhenUsernameExists() {
        User user = new User();
        user.setUsername("existing");
        user.setEmail("test@example.com");

        when(userRepository.findByUsername("existing")).thenReturn(Optional.of(new User()));

        assertThrows(RuntimeException.class, () -> userService.createUser(user));
        verify(userRepository, never()).save(any());
    }

    @Test
    void createUser_shouldThrowWhenEmailExists() {
        User user = new User();
        user.setUsername("newuser");
        user.setEmail("existing@example.com");

        when(userRepository.findByUsername("newuser")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(new User()));

        assertThrows(RuntimeException.class, () -> userService.createUser(user));
        verify(userRepository, never()).save(any());
    }

    @Test
    void getUserById_shouldReturnUser() {
        User user = new User();
        user.setId(1);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        Optional<User> result = userService.getUserById(1);

        assertTrue(result.isPresent());
        assertEquals(1, result.get().getId());
    }

    @Test
    void getUserById_shouldReturnEmptyWhenNotFound() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        Optional<User> result = userService.getUserById(99);

        assertTrue(result.isEmpty());
    }

    @Test
    void deleteUser_shouldCallRepository() {
        userService.deleteUser(1);
        verify(userRepository).deleteById(1);
    }

    @Test
    void changePassword_shouldEncodeAndSave() {
        User user = new User();
        user.setPassword("oldEncoded");
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        userService.changePassword(1, "newPassword");

        assertTrue(passwordEncoder.matches("newPassword", user.getPassword()));
        verify(userRepository).save(user);
    }
}
