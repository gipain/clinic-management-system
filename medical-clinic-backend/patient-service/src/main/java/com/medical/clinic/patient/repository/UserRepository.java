package com.medical.clinic.patient.repository;

import com.medical.clinic.patient.entity.User;
import com.medical.clinic.common.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    List<User> findByRole(UserRole role);
}
