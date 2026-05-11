package com.medical.clinic.patient.entity;

import com.medical.clinic.common.model.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private String firstName;
    private String lastName;
    private Integer age;
    private String phone;
    private String education;
    private String specialty;

    @Column(columnDefinition = "TEXT")
    private String pendingChanges;

    @Column(name = "plain_password")
    private String plainPassword;
}
