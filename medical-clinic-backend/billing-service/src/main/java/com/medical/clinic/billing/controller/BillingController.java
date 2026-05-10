package com.medical.clinic.billing.controller;

import com.medical.clinic.billing.entity.Payment;
import com.medical.clinic.billing.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
public class BillingController {

    private static final BigDecimal FIRST_VISIT_PRICE  = new BigDecimal("1000.00");
    private static final BigDecimal REPEAT_VISIT_PRICE = new BigDecimal("800.00");

    private final PaymentRepository paymentRepository;

    // ── Read ──────────────────────────────────────────────────────────────────

    @GetMapping("/all")
    public ResponseEntity<List<Payment>> getAllBills() {
        return ResponseEntity.ok(paymentRepository.findAll());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Payment>> getPatientBills(@PathVariable Long patientId) {
        return ResponseEntity.ok(paymentRepository.findByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Payment>> getDoctorBills(@PathVariable Long doctorId) {
        return ResponseEntity.ok(paymentRepository.findByDoctorId(doctorId));
    }

    // ── Create ────────────────────────────────────────────────────────────────

    /**
     * Auto-creates a bill after a treatment record.
     * Determines price automatically:
     *   - First bill for this patient+doctor pair → 1000 UAH
     *   - Subsequent bills                        → 800 UAH
     */
    @PostMapping("/create")
    public ResponseEntity<?> createBill(@RequestBody Map<String, Object> body) {
        Long patientId      = Long.valueOf(body.get("patientId").toString());
        Long doctorId       = Long.valueOf(body.get("doctorId").toString());
        Long appointmentId  = body.containsKey("appointmentId")
                ? Long.valueOf(body.get("appointmentId").toString()) : null;
        String serviceType  = body.getOrDefault("serviceType", "Medical Consultation").toString();

        // Prevent duplicate bill for same appointment
        if (appointmentId != null && paymentRepository.existsByAppointmentId(appointmentId)) {
            return ResponseEntity.ok(Map.of("message", "Bill already exists for this appointment"));
        }

        List<Payment> previous = paymentRepository.findByPatientIdAndDoctorId(patientId, doctorId);
        BigDecimal amount = previous.isEmpty() ? FIRST_VISIT_PRICE : REPEAT_VISIT_PRICE;

        Payment payment = Payment.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .appointmentId(appointmentId)
                .amount(amount)
                .serviceType(serviceType)
                .paymentDate(LocalDateTime.now())
                .status("PENDING")
                .paymentMethod(null)
                .build();

        return ResponseEntity.ok(paymentRepository.save(payment));
    }

    // ── Payment actions ───────────────────────────────────────────────────────

    /**
     * Online card payment — validates card format, marks as PAID immediately.
     */
    @PostMapping("/{id}/pay-online")
    public ResponseEntity<?> payOnline(@PathVariable Long id, @RequestBody Map<String, String> card) {
        String cardNumber = card.getOrDefault("cardNumber", "").replaceAll("\\s", "");
        String expiry     = card.getOrDefault("expiry", "");
        String cvv        = card.getOrDefault("cvv", "");

        if (!cardNumber.matches("\\d{16}"))
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid card number (must be 16 digits)"));
        if (!expiry.matches("(0[1-9]|1[0-2])/\\d{2}"))
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid expiry date (MM/YY)"));
        if (!cvv.matches("\\d{3}"))
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid CVV (must be 3 digits)"));

        return paymentRepository.findById(id).map(p -> {
            if ("PAID".equals(p.getStatus()))
                return ResponseEntity.badRequest().body(Map.of("message", "Already paid"));
            p.setStatus("PAID");
            p.setPaymentMethod("ONLINE");
            p.setPaymentDate(LocalDateTime.now());
            return ResponseEntity.ok(paymentRepository.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cash payment — marks as PAID by doctor or admin at reception.
     */
    @PostMapping("/{id}/pay-cash")
    public ResponseEntity<?> payCash(@PathVariable Long id) {
        return paymentRepository.findById(id).map(p -> {
            if ("PAID".equals(p.getStatus()))
                return ResponseEntity.badRequest().body(Map.of("message", "Already paid"));
            p.setStatus("PAID");
            p.setPaymentMethod("CASH");
            p.setPaymentDate(LocalDateTime.now());
            return ResponseEntity.ok(paymentRepository.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Legacy endpoint kept for compatibility. */
    @PostMapping("/{id}/pay")
    public ResponseEntity<?> pay(@PathVariable Long id) {
        return payCash(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBill(@PathVariable Long id) {
        if (!paymentRepository.existsById(id)) return ResponseEntity.notFound().build();
        paymentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Bill deleted"));
    }
}
