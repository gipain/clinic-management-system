package com.medical.clinic.patient.controller;

import com.medical.clinic.common.model.UserRole;
import com.medical.clinic.common.security.JwtUtils;
import com.medical.clinic.patient.entity.User;
import com.medical.clinic.patient.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(UserRole.PATIENT); // Default role for registration
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
            "message", "User registered successfully",
            "userId", savedUser.getId(),
            "username", savedUser.getUsername()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            User user = userOpt.get();
            String token = jwtUtils.generateToken(username, user.getRole().name());
            return ResponseEntity.ok(Map.of(
                "token", token,
                "role", user.getRole().name(),
                "userId", user.getId(),
                "username", user.getUsername(),
                "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                "lastName", user.getLastName() != null ? user.getLastName() : ""
            ));
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
    }

    @PostMapping("/recover")
    public ResponseEntity<?> recoverPassword(@RequestBody Map<String, String> request) {
        // Simple mock for password recovery
        return ResponseEntity.ok("Password recovery instructions sent to your registered contact.");
    }
}
