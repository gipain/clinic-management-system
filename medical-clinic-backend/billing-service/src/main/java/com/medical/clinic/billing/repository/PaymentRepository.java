package com.medical.clinic.billing.repository;

import com.medical.clinic.billing.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByPatientId(Long patientId);
    List<Payment> findByDoctorId(Long doctorId);
    List<Payment> findByPatientIdAndDoctorId(Long patientId, Long doctorId);
    boolean existsByAppointmentId(Long appointmentId);
}
