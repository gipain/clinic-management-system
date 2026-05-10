# Medical Clinic Management System - Backend

This is a microservices-based backend for a Medical Clinic Management System built with Spring Boot, Spring Cloud, MySQL, Redis, and Docker.

## Microservices
1. **API Gateway (Port 8080)**: Entry point for all requests.
2. **Patient Service (Port 8081)**: Manages user registration, profiles, and authentication.
3. **Appointment Service (Port 8082)**: Handles scheduling, calendars, and approval flows. Implements Redis caching.
4. **Treatment Service (Port 8083)**: Manages diagnoses, prescriptions, and treatment history.
5. **Billing Service (Port 8084)**: Calculates service costs and processes payments.

## Key Features
- **Authentication**: JWT-based security with roles (ADMIN, DOCTOR, PATIENT).
- **Caching**: Spring Cache with Redis in Appointment Service for doctor calendars.
- **Business Logic**: Automated treatment history generation, cost calculation, and approval flows.
- **Dockerization**: Full orchestration with Docker Compose.

## How to Run
1. Ensure you have Docker and Maven installed.
2. Build the project:
   ```bash
   mvn clean install -DskipTests
   ```
3. Start the services:
   ```bash
   docker-compose up --build
   ```

## API Endpoints
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
- **Profiles**: `GET /api/patients/doctors`, `GET /api/patients/{id}`
- **Appointments**: `GET /api/appointments/doctor/{doctorId}`, `POST /api/appointments`
- **Treatments**: `GET /api/treatments/patient/{patientId}`, `POST /api/treatments`
- **Billing**: `POST /api/billing/calculate`, `POST /api/billing/{id}/pay`
