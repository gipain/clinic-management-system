package com.medical.clinic.billing.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;
    private Long doctorId;
    private Long appointmentId;
    private BigDecimal amount;
    private String serviceType;
    private LocalDateTime paymentDate;
    private String status;       // PENDING, PAID
    private String paymentMethod; // ONLINE, CASH
}
