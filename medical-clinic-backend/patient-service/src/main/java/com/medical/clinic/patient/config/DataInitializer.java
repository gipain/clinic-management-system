package com.medical.clinic.patient.config;

import com.medical.clinic.common.model.UserRole;
import com.medical.clinic.patient.entity.User;
import com.medical.clinic.patient.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize demo users if they don't exist
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("password"))
                    .plainPassword("password")
                    .firstName("Admin")
                    .lastName("User")
                    .role(UserRole.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("✓ Admin user created: admin/password");
        }

        if (userRepository.findByUsername("doctor").isEmpty()) {
            User doctor = User.builder()
                    .username("doctor")
                    .password(passwordEncoder.encode("password"))
                    .plainPassword("password")
                    .firstName("John")
                    .lastName("Doctor")
                    .role(UserRole.DOCTOR)
                    .specialty("General Medicine")
                    .education("MD, Harvard Medical School")
                    .phone("555-0001")
                    .build();
            userRepository.save(doctor);
            System.out.println("✓ Doctor user created: doctor/password");
        }

        if (userRepository.findByUsername("patient").isEmpty()) {
            User patient = User.builder()
                    .username("patient")
                    .password(passwordEncoder.encode("password"))
                    .plainPassword("password")
                    .firstName("Jane")
                    .lastName("Patient")
                    .age(35)
                    .role(UserRole.PATIENT)
                    .phone("555-0002")
                    .build();
            userRepository.save(patient);
            System.out.println("✓ Patient user created: patient/password");
        }
    }
}
