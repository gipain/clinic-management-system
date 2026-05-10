package com.medical.clinic.treatment.repository;

import com.medical.clinic.treatment.entity.TreatmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TreatmentRepository extends JpaRepository<TreatmentRecord, Long> {
    List<TreatmentRecord> findByPatientId(Long patientId);
    List<TreatmentRecord> findByDoctorId(Long doctorId);
    List<TreatmentRecord> findByDoctorIdAndPatientId(Long doctorId, Long patientId);
}
