# Medical Clinic Management System — Package Contents

## Project Overview

Full-stack medical clinic management system built on Spring Boot microservices (backend) and React + TypeScript (frontend). Supports three user roles — Admin, Doctor, Patient — each with a dedicated feature set.

---

## Repository Structure

```
medical-clinic-system/
├── medical-clinic-backend/      # Spring Boot microservices
├── medical-clinic-frontend/     # React + TypeScript SPA
├── k8s/                         # Kubernetes manifests
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
├── Dockerfile                            # Multi-stage build for all services
├── Dockerfile.template                   # Per-service Dockerfile template
├── api-gateway/Dockerfile.k8s            # Kubernetes image build (copies pre-built JAR)
├── patient-service/Dockerfile.k8s
├── appointment-service/Dockerfile.k8s
├── treatment-service/Dockerfile.k8s
└── billing-service/Dockerfile.k8s
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
├── components.json                           # shadcn/ui config
├── Dockerfile.k8s                            # nginx image for Kubernetes deployment
└── nginx.conf                                # nginx config: serves SPA + proxies /api → api-gateway
```

---

## Kubernetes Deployment (`k8s/`)

```
k8s/
├── 00-namespace.yaml          # Namespace: clinic
├── 01-mysql.yaml              # MySQL Deployment + Service + Secret + PVC
├── 02-patient-service.yaml    # patient-service Deployment + ClusterIP Service
├── 03-appointment-service.yaml  # appointment-service (2 replicas) + RollingUpdate + Service
├── 04-treatment-service.yaml  # treatment-service Deployment + Service
├── 05-billing-service.yaml    # billing-service Deployment + Service
├── 06-api-gateway.yaml        # api-gateway Deployment + NodePort Service (:30080)
└── 07-frontend.yaml           # frontend nginx Deployment + NodePort Service (:30000)
```

### Kubernetes Architecture

- **Cluster**: Minikube (single-node, Docker driver)
- **Namespace**: `clinic`
- **Total Pods**: 9 (mysql ×1, api-gateway ×1, patient ×1, appointment ×3, treatment ×1, billing ×1, frontend ×1)
- **External access**: frontend NodePort `30000`, api-gateway NodePort `30080`
- **Internal DNS**: services reach each other by name (e.g. `mysql-service:3306`, `api-gateway:8080`)
- **nginx proxy**: frontend container proxies `/api/*` → `api-gateway:8080` (browser only needs one port)
- **Scaling**: appointment-service scaled to 3 replicas with `kubectl scale`
- **Rolling update**: appointment-service updated `1.0 → 1.1` with zero downtime

### Quick Deploy to Kubernetes

```bash
# 1. Start Minikube
minikube start --driver=docker

# 2. Build & load images
docker build -f medical-clinic-backend/api-gateway/Dockerfile.k8s     -t clinic/api-gateway:1.0     medical-clinic-backend/api-gateway
docker build -f medical-clinic-backend/patient-service/Dockerfile.k8s -t clinic/patient-service:1.0 medical-clinic-backend/patient-service
docker build -f medical-clinic-backend/appointment-service/Dockerfile.k8s -t clinic/appointment-service:1.0 medical-clinic-backend/appointment-service
docker build -f medical-clinic-backend/treatment-service/Dockerfile.k8s   -t clinic/treatment-service:1.0   medical-clinic-backend/treatment-service
docker build -f medical-clinic-backend/billing-service/Dockerfile.k8s     -t clinic/billing-service:1.0     medical-clinic-backend/billing-service
docker build -f medical-clinic-frontend/Dockerfile.k8s -t clinic/frontend:1.0 medical-clinic-frontend

minikube image load clinic/api-gateway:1.0
minikube image load clinic/patient-service:1.0
minikube image load clinic/appointment-service:1.0
minikube image load clinic/treatment-service:1.0
minikube image load clinic/billing-service:1.0
minikube image load clinic/frontend:1.0

# 3. Apply manifests
kubectl apply -f k8s/

# 4. Port-forward (Windows/Mac — Minikube Docker driver)
kubectl port-forward svc/frontend 3001:80 -n clinic
```

Open **http://localhost:3001**

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

### Infrastructure (Kubernetes)
| Technology | Version |
|------------|---------|
| Kubernetes | v1.35.1 |
| Minikube | v1.38.1 |
| kubectl | v1.36.0 |
| nginx | alpine (frontend container) |

---

## File Statistics

- **Backend Java source files**: 30+
- **Frontend TypeScript/TSX files**: 40+
- **shadcn/ui components**: 50+
- **Docker containers**: 6 (MySQL + 5 Spring Boot services) / 7 with frontend
- **Kubernetes manifests**: 8 YAML files
- **Kubernetes Pods (running)**: 9
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

### Option A — Docker Compose (local dev)
1. Clone the repository
2. Follow **SETUP_GUIDE.md** for full installation instructions
3. Run `mvn clean install -DskipTests && docker-compose up --build` in `medical-clinic-backend/`
4. Run `npm install && npm run dev` in `medical-clinic-frontend/`
5. Open `http://localhost:3000`

### Option B — Kubernetes (Minikube)
1. Build JARs: `mvn clean install -DskipTests` in `medical-clinic-backend/`
2. Build Docker images (see `k8s/` Quick Deploy section above)
3. `kubectl apply -f k8s/`
4. `kubectl port-forward svc/frontend 3001:80 -n clinic`
5. Open `http://localhost:3001`

See **DEPLOYMENT.md** for detailed deployment, environment configuration, and troubleshooting.
