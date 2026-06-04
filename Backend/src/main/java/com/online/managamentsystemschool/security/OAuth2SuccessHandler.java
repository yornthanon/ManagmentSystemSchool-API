package com.online.managamentsystemschool.security;

import com.online.managamentsystemschool.entity.User;
import com.online.managamentsystemschool.entity.enums.Role;
import com.online.managamentsystemschool.repository.UserRepository;
import com.online.managamentsystemschool.util.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.oauth2.redirect-url:http://localhost:5173/oauth2/redirect}")
    private String redirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getName();

        // Check if admin tries to login with Google (deny)
        User existingUser = userRepository.findByEmail(email).orElse(null);
        if (existingUser != null && existingUser.getRole() == Role.ADMIN) {
            response.sendRedirect(redirectUrl + "?error=admin_cannot_use_oauth2");
            return;
        }

        // Find or create user
        User user = userRepository.findByEmailAndProvider(email, "google")
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFullName(name);
                    newUser.setUsername(email.split("@")[0] + "-" + UUID.randomUUID().toString().substring(0, 6));
                    newUser.setRole(Role.STUDENT);  // Default new OAuth2 users as STUDENT
                    newUser.setProvider("google");
                    newUser.setProviderId(providerId);
                    newUser.setPassword(null);  // OAuth2 users don't have password
                    return userRepository.save(newUser);
                });

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().toString());

        // Redirect to frontend with token
        String targetUrl = redirectUrl + "?token=" + token + "&email=" + user.getEmail() + "&role=" + user.getRole().toString();
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

