package com.medical.clinic.treatment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.medical.clinic.treatment", "com.medical.clinic.common.security"})
public class TreatmentApplication {
    public static void main(String[] args) {
        SpringApplication.run(TreatmentApplication.class, args);
    }
}
