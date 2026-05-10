# Medical Clinic Management System — Package Contents

## Project Overview

Full-stack medical clinic management system built on Spring Boot microservices (backend) and React + TypeScript (frontend). Supports three user roles — Admin, Doctor, Patient — each with a dedicated feature set.

---

## Repository Structure

```
medical-clinic-system/
├── medical-clinic-backend/      # Spring Boot microservices
├── medical-clinic-frontend/     # React + TypeScript SPA
├── README.md
├── SETUP_GUIDE.md
├── DEPLOYMENT.md
└── PACKAGE_CONTENTS.md          # This file
```

---

## Backend (Spring Boot Microservices)

```
medical-clinic-backend/
├── api-gateway/                          # Spring Cloud Gateway — request routing & CORS
│   ├── src/main/resources/
│   │   └── application.yml               # Routes with StripPrefix=1 (/api/* → service)
│   ├── pom.xml
│   └── Dockerfile
│
├── patient-service/                      # Authentication & user management  (port 8081)
│   ├── src/main/java/com/medical/clinic/patient/
│   │   ├── config/
│   │   │   ├── SecurityConfig.java       # Stateless, permitAll (JWT enforced at gateway)
│   │   │   └── DataInitializer.java      # Seeds default admin/doctor/patient accounts
│   │   ├── controller/
│   │   │   ├── AuthController.java       # POST /auth/register, /login, /recover
│   │   │   └── ProfileController.java    # CRUD /patients, /patients/doctors,
│   │   │                                 # change-request approval workflow
│   │   ├── entity/
│   │   │   └── User.java                 # Includes pendingChanges (TEXT) field
│   │   └── repository/
│   │       └── UserRepository.java
│   ├── src/main/resources/application.yml
│   ├── pom.xml
│   └── Dockerfile
│
├── appointment-service/                  # Appointment lifecycle  (port 8082)
│   ├── src/main/java/com/medical/clinic/appointment/
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   └── AppointmentController.java  # GET /all, /doctor/{id}, /patient/{id}
│   │   │                                   # POST /, PATCH /{id}/status, DELETE /{id}
│   │   ├── service/
│   │   │   └── AppointmentService.java     # In-memory cache (Spring simple cache)
│   │   ├── entity/
│   │   │   └── Appointment.java
│   │   └── repository/
│   │       └── AppointmentRepository.java
│   ├── src/main/resources/application.yml  # spring.cache.type: simple (no Redis)
│   ├── pom.xml
│   └── Dockerfile
│
├── treatment-service/                    # Medical records  (port 8083)
│   ├── src/main/java/com/medical/clinic/treatment/
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   └── TreatmentController.java    # GET /patient/{id}, /doctor/{id},
│   │   │                                   # /doctor/{did}/patient/{pid}
│   │   │                                   # POST /
│   │   ├── entity/
│   │   │   └── TreatmentRecord.java
│   │   └── repository/
│   │       └── TreatmentRepository.java    # findByDoctorIdAndPatientId query
│   ├── src/main/resources/application.yml
│   ├── pom.xml
│   └── Dockerfile
│
├── billing-service/                      # Billing & payments  (port 8084)
│   ├── src/main/java/com/medical/clinic/billing/
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   └── BillingController.java      # GET /all, /patient/{id}, /doctor/{id}
│   │   │                                   # POST /create (auto-price logic)
│   │   │                                   # POST /{id}/pay-online, /{id}/pay-cash
│   │   │                                   # DELETE /{id}
│   │   ├── entity/
│   │   │   └── Payment.java                # patientId, doctorId, appointmentId,
│   │   │                                   # amount, status, paymentMethod, serviceType
│   │   └── repository/
│   │       └── PaymentRepository.java      # existsByAppointmentId (idempotency guard)
│   ├── src/main/resources/application.yml
│   ├── pom.xml
│   └── Dockerfile
│
├── common-module/                        # Shared library (JWT, roles)
│   ├── src/main/java/com/medical/clinic/common/
│   │   ├── model/
│   │   │   └── UserRole.java             # ADMIN, DOCTOR, PATIENT
│   │   └── security/
│   │       └── JwtUtils.java             # JJWT 0.12.x API
│   └── pom.xml
│
├── pom.xml                               # Parent POM — manages all modules
├── docker-compose.yml                    # Orchestrates 6 containers (no Redis)
└── Dockerfile                            # Multi-stage build for all services
```

---

## Frontend (React + TypeScript)

```
medical-clinic-frontend/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx                      # Login form
│   │   │   ├── Register.tsx                   # Patient self-registration
│   │   │   ├── Dashboard.tsx                  # Role-aware dashboard
│   │   │   ├── NotFound.tsx                   # 404 page
│   │   │   │
│   │   │   ├── ── Admin pages ──
│   │   │   ├── AdminDoctors.tsx               # Add/delete doctors, approve profile changes
│   │   │   ├── AdminPatients.tsx              # View/delete patients
│   │   │   ├── AdminAppointments.tsx          # Create/status/delete appointments,
│   │   │   │                                  # auto-bill on COMPLETED
│   │   │   ├── AdminBilling.tsx               # View all bills, pay cash, delete
│   │   │   │
│   │   │   ├── ── Doctor pages ──
│   │   │   ├── Appointments.tsx               # Doctor & Patient appointment views,
│   │   │   │                                  # Complete button → auto-bill
│   │   │   ├── DoctorPatients.tsx             # Patient list, book appointment
│   │   │   ├── DoctorPatientHistory.tsx       # Per-patient treatment history
│   │   │   ├── DoctorTreatments.tsx           # Create/view treatment records
│   │   │   ├── DoctorBilling.tsx              # Doctor's billing overview, pay cash
│   │   │   ├── DoctorProfile.tsx              # Edit profile / submit change request
│   │   │   │
│   │   │   ├── ── Patient pages ──
│   │   │   ├── PatientDoctors.tsx             # Doctor directory
│   │   │   ├── PatientHistory.tsx             # Personal medical history
│   │   │   ├── Billing.tsx                    # Patient bills, online card payment,
│   │   │   │                                  # summary totals in ₴
│   │   │   └── PatientProfile.tsx             # Edit profile / submit change request
│   │   │
│   │   ├── components/
│   │   │   ├── layouts/
│   │   │   │   └── Sidebar.tsx               # Role-filtered navigation sidebar
│   │   │   ├── ProtectedRoute.tsx            # Route guard with requiredRoles
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ui/                           # shadcn/ui component library (50+ components)
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                        # Axios client — authService, patientService,
│   │   │                                     # appointmentService, treatmentService,
│   │   │                                     # billingService
│   │   │
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx               # user, login, logout, updateUser
│   │   │   └── ThemeContext.tsx              # Light/dark theme
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                      # User, Appointment, TreatmentRecord, Payment
│   │   │
│   │   ├── App.tsx                           # Wouter routing, RootRedirect
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   └── index.html
│
├── server/
│   └── index.ts                              # Express server (production mode)
│
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── components.json                           # shadcn/ui config
```

---

## Key Features

### Role: Admin
- Add and delete doctors (including specialty field)
- View and delete patients
- Create, change status, and delete appointments
- View all bills; mark as paid (cash); delete bills
- Approve or reject doctor/patient profile change requests

### Role: Doctor
- View own appointment calendar with patient names
- Mark appointments as **COMPLETED** → bill auto-created for patient
- Create treatment records (diagnosis, prescription, procedures)
- View treatment records per patient
- Book appointments for patients with themselves
- View billing for own appointments; mark cash payment
- Edit profile or submit a change request for admin approval

### Role: Patient
- Browse doctor directory
- Book appointments (select doctor, pick date & time)
- View personal medical history (treatment records)
- View bills with totals in ₴; pay online by card or in cash at reception
- Edit profile or submit a change request for admin approval

---

## Billing Logic

| Situation | Price |
|-----------|-------|
| First appointment between a patient and a given doctor | ₴1 000 |
| All subsequent appointments with the same doctor | ₴800 |

- Bill is created automatically when an appointment is marked **COMPLETED** (by doctor or admin).
- Duplicate protection: `existsByAppointmentId` prevents a second bill for the same appointment.
- Payment methods: **Online** (card — 16-digit number, MM/YY expiry, 3-digit CVV) or **Cash** (at reception).

---

## Technology Stack

### Backend
| Technology | Version |
|------------|---------|
| Java | 17 |
| Spring Boot | 3.2.4 |
| Spring Cloud Gateway | 2023.0.0 |
| Spring Data JPA | (Boot-managed) |
| Spring Security | Stateless / JWT |
| JJWT | 0.12.3 |
| MySQL | 8.0 |
| Docker & Docker Compose | latest |
| Maven | 3.9+ |

> **Redis removed.** Appointment caching uses Spring's in-memory `simple` cache (ConcurrentHashMap). No external cache dependency required.

### Frontend
| Technology | Version |
|------------|---------|
| React | 19 |
| TypeScript | 5.6+ |
| Vite | 7 |
| Tailwind CSS | 4 |
| shadcn/ui | latest |
| Wouter | routing |
| Axios | HTTP client |
| Sonner | toast notifications |
| Lucide React | icons |

---

## File Statistics

- **Backend Java source files**: 30+
- **Frontend TypeScript/TSX files**: 40+
- **shadcn/ui components**: 50+
- **Docker containers**: 6 (MySQL + 5 Spring Boot services)
- **Documentation files**: 5

---

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | password |
| Doctor | doctor | password |
| Patient | patient | password |

---

## Getting Started

1. Clone the repository
2. Follow **SETUP_GUIDE.md** for full installation instructions
3. Run `mvn clean install -DskipTests && docker-compose up --build` in `medical-clinic-backend/`
4. Run `npm install && npm run dev` in `medical-clinic-frontend/`
5. Open `http://localhost:3000`

See **DEPLOYMENT.md** for detailed deployment, environment configuration, and troubleshooting.
