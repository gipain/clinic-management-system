package com.medical.clinic.appointment.service;

import com.medical.clinic.appointment.entity.Appointment;
import com.medical.clinic.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;

    @Cacheable(value = "appointments", key = "#doctorId")
    public List<Appointment> getDoctorCalendar(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    @CacheEvict(value = "appointments", key = "#appointment.doctorId")
    public Appointment createAppointment(Appointment appointment) {
        appointment.setStatus(Appointment.AppointmentStatus.PENDING_APPROVAL);
        return appointmentRepository.save(appointment);
    }

    @CacheEvict(value = "appointments", allEntries = true)
    public Appointment updateStatus(Long id, Appointment.AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow();
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    @CacheEvict(value = "appointments", allEntries = true)
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
}
