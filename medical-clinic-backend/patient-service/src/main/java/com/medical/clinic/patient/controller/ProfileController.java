package com.medical.clinic.patient.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medical.clinic.common.model.UserRole;
import com.medical.clinic.patient.entity.User;
import com.medical.clinic.patient.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class ProfileController {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    // ── Doctors ──────────────────────────────────────────────────────────────

    @GetMapping("/doctors")
    public ResponseEntity<List<User>> getAllDoctors() {
        return ResponseEntity.ok(userRepository.findByRole(UserRole.DOCTOR));
    }

    @PostMapping("/doctors")
    public ResponseEntity<?> addDoctor(@RequestBody User doctor) {
        if (userRepository.findByUsername(doctor.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }
        doctor.setRole(UserRole.DOCTOR);
        doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        return ResponseEntity.ok(userRepository.save(doctor));
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        return userRepository.findById(id)
                .filter(u -> u.getRole() == UserRole.DOCTOR)
                .map(u -> { userRepository.delete(u); return ResponseEntity.ok(Map.of("message", "Doctor deleted")); })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Patients ─────────────────────────────────────────────────────────────

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllPatients() {
        return ResponseEntity.ok(userRepository.findByRole(UserRole.PATIENT));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> { userRepository.delete(u); return ResponseEntity.ok(Map.of("message", "User deleted")); })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return userRepository.findById(id).map(user -> {
            if (updates.containsKey("firstName"))  user.setFirstName((String) updates.get("firstName"));
            if (updates.containsKey("lastName"))   user.setLastName((String) updates.get("lastName"));
            if (updates.containsKey("age"))        user.setAge((Integer) updates.get("age"));
            if (updates.containsKey("phone"))      user.setPhone((String) updates.get("phone"));
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Doctor profile change requests ────────────────────────────────────────

    @PostMapping("/{id}/request-change")
    public ResponseEntity<?> requestChange(@PathVariable Long id, @RequestBody Map<String, Object> proposed) {
        return userRepository.findById(id).map(user -> {
            try {
                user.setPendingChanges(objectMapper.writeValueAsString(proposed));
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Change request submitted"));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body(Map.of("message", "Failed to save request"));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/change-requests")
    public ResponseEntity<List<User>> getPendingChangeRequests() {
        List<User> pending = userRepository.findAll().stream()
                .filter(u -> u.getPendingChanges() != null && !u.getPendingChanges().isBlank())
                .toList();
        return ResponseEntity.ok(pending);
    }

    @PutMapping("/{id}/approve-change")
    public ResponseEntity<?> approveChange(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            try {
                if (user.getPendingChanges() == null) return ResponseEntity.badRequest().body(Map.of("message", "No pending changes"));
                @SuppressWarnings("unchecked")
                Map<String, Object> changes = objectMapper.readValue(user.getPendingChanges(), Map.class);
                if (changes.containsKey("firstName"))  user.setFirstName((String) changes.get("firstName"));
                if (changes.containsKey("lastName"))   user.setLastName((String) changes.get("lastName"));
                if (changes.containsKey("specialty"))  user.setSpecialty((String) changes.get("specialty"));
                if (changes.containsKey("education"))  user.setEducation((String) changes.get("education"));
                if (changes.containsKey("phone"))      user.setPhone((String) changes.get("phone"));
                user.setPendingChanges(null);
                return ResponseEntity.ok(userRepository.save(user));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body(Map.of("message", "Failed to apply changes"));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject-change")
    public ResponseEntity<?> rejectChange(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setPendingChanges(null);
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }
}
