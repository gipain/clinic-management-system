package com.medical.clinic.appointment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;
    private Long doctorId;
    private LocalDateTime appointmentTime;
    
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status; // PENDING_APPROVAL, APPROVED, REJECTED, COMPLETED

    public enum AppointmentStatus {
        PENDING_APPROVAL, APPROVED, REJECTED, COMPLETED
    }
}
