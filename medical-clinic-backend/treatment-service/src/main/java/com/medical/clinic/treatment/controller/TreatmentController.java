package com.medical.clinic.treatment.controller;

import com.medical.clinic.treatment.entity.TreatmentRecord;
import com.medical.clinic.treatment.repository.TreatmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/treatments")
@RequiredArgsConstructor
public class TreatmentController {
    private final TreatmentRepository treatmentRepository;

    @PostMapping
    public ResponseEntity<TreatmentRecord> createRecord(@RequestBody TreatmentRecord record) {
        record.setRecordDate(LocalDateTime.now());
        return ResponseEntity.ok(treatmentRepository.save(record));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<TreatmentRecord>> getPatientHistory(@PathVariable Long patientId) {
        return ResponseEntity.ok(treatmentRepository.findByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<TreatmentRecord>> getDoctorRecords(@PathVariable Long doctorId) {
        return ResponseEntity.ok(treatmentRepository.findByDoctorId(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/patient/{patientId}")
    public ResponseEntity<List<TreatmentRecord>> getPatientHistoryForDoctor(
            @PathVariable Long doctorId, @PathVariable Long patientId) {
        return ResponseEntity.ok(treatmentRepository.findByPatientId(patientId));
    }
}
