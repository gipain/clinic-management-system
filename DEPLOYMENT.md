# Medical Clinic Management System — Deployment Guide

## System Requirements

| Dependency | Minimum Version | Notes |
|------------|----------------|-------|
| Docker Desktop | Latest | Docker Compose v2 included |
| Java JDK | 17 | Eclipse Temurin recommended |
| Maven | 3.9+ | Used to build backend JARs |
| Node.js | 18+ | For frontend dev server / build |
| Git | Any | Version control |

> **No Redis required.** The appointment service uses Spring's in-memory cache.

---

## Quick Start — Local Development

### 1. Build & Start Backend

```bash
cd medical-clinic-backend

# Build all JARs (skipping tests for speed)
mvn clean install -DskipTests

# Start all containers (MySQL + 5 Spring Boot services)
docker-compose up --build
```

Wait until all services report healthy:

```bash
docker-compose ps
```

Expected output — all containers should be `Up` or `healthy`:

| Container | Port | Role |
|-----------|------|------|
| medical-clinic-mysql | 3306 | MySQL 8.0 database |
| medical-clinic-gateway | 8080 | API Gateway (entry point) |
| medical-clinic-patient | 8081 | Auth & user management |
| medical-clinic-appointment | 8082 | Appointment lifecycle |
| medical-clinic-treatment | 8083 | Medical records |
| medical-clinic-billing | 8084 | Billing & payments |

### 2. Start Frontend

In a second terminal:

```bash
cd medical-clinic-frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### 3. Login with Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | password |
| Doctor | doctor | password |
| Patient | patient | password |

---

## Gateway Routing

All browser requests hit `http://localhost:8080/api/**`. The API Gateway strips the `/api` prefix and forwards to the correct service:

| Path prefix | Routed to |
|-------------|-----------|
| `/api/auth/**` | patient-service:8081 |
| `/api/patients/**` | patient-service:8081 |
| `/api/appointments/**` | appointment-service:8082 |
| `/api/treatments/**` | treatment-service:8083 |
| `/api/billing/**` | billing-service:8084 |

---

## API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new patient account |
| POST | `/api/auth/login` | Login, returns JWT token |
| POST | `/api/auth/recover` | Password recovery |

### Patients & Doctors (`/api/patients`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/patients/doctors` | List all doctors |
| POST | `/api/patients/doctors` | Add doctor (Admin) |
| DELETE | `/api/patients/doctors/{id}` | Delete doctor (Admin) |
| GET | `/api/patients/all` | List all patients (Admin/Doctor) |
| DELETE | `/api/patients/{id}` | Delete patient (Admin) |
| GET | `/api/patients/{id}` | Get user profile |
| PUT | `/api/patients/{id}` | Update profile (Admin) |
| POST | `/api/patients/{id}/request-change` | Submit profile change request |
| GET | `/api/patients/change-requests` | List pending change requests (Admin) |
| PUT | `/api/patients/{id}/approve-change` | Approve change request (Admin) |
| PUT | `/api/patients/{id}/reject-change` | Reject change request (Admin) |

### Appointments (`/api/appointments`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/appointments/all` | List all appointments (Admin) |
| GET | `/api/appointments/doctor/{doctorId}` | Doctor's appointment calendar |
| GET | `/api/appointments/patient/{patientId}` | Patient's appointments |
| POST | `/api/appointments` | Book appointment |
| PATCH | `/api/appointments/{id}/status` | Update status (`?status=APPROVED` etc.) |
| DELETE | `/api/appointments/{id}` | Delete appointment (Admin) |

**Appointment statuses:** `PENDING_APPROVAL` → `APPROVED` → `COMPLETED` (or `REJECTED`)

> When status is set to **COMPLETED**, the frontend automatically calls `POST /api/billing/create` to generate the patient's bill.

### Treatments (`/api/treatments`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/treatments/patient/{patientId}` | Patient's full medical history |
| GET | `/api/treatments/doctor/{doctorId}` | All records created by a doctor |
| GET | `/api/treatments/doctor/{did}/patient/{pid}` | Doctor's records for one patient |
| POST | `/api/treatments` | Create treatment record |

### Billing (`/api/billing`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/billing/all` | All bills (Admin) |
| GET | `/api/billing/patient/{patientId}` | Patient's bills |
| GET | `/api/billing/doctor/{doctorId}` | Bills for a doctor's appointments |
| POST | `/api/billing/create` | Auto-create bill (idempotent by appointmentId) |
| POST | `/api/billing/{id}/pay-online` | Pay by card (validates 16-digit, MM/YY, CVV) |
| POST | `/api/billing/{id}/pay-cash` | Mark as paid in cash |
| DELETE | `/api/billing/{id}` | Delete bill (Admin) |

**Pricing:** ₴1 000 for first appointment with a given doctor; ₴800 for all subsequent ones.

---

## Environment Configuration

### Frontend

Create `medical-clinic-frontend/.env` (development):

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Medical Clinic Management System
VITE_ENV=development
```

For production deployment create `.env.production`:

```env
VITE_API_URL=https://api.your-domain.com/api
VITE_APP_NAME=Medical Clinic Management System
VITE_ENV=production
```

### Backend (Docker Compose)

All configuration is injected via environment variables in `docker-compose.yml`. Defaults for local development:

```yaml
SPRING_DATASOURCE_URL: jdbc:mysql://mysql-db:3306/<service>_db?createDatabaseIfNotExist=true
SPRING_DATASOURCE_USERNAME: root
SPRING_DATASOURCE_PASSWORD: password
```

Each service gets its own isolated MySQL schema (`patient_db`, `appointment_db`, `treatment_db`, `billing_db`).

---

## Docker Operations

### Rebuild after code changes

```bash
cd medical-clinic-backend
mvn clean install -DskipTests
docker-compose up --build
```

### Rebuild a single service

```bash
docker-compose up --build billing-service
```

### Run in detached (background) mode

```bash
docker-compose up -d
```

### View live logs

```bash
docker-compose logs -f api-gateway
docker-compose logs -f patient-service
docker-compose logs -f billing-service
```

### Stop all services

```bash
docker-compose down
```

### Stop and wipe database volumes

```bash
docker-compose down -v
```

---

## Frontend Build & Deployment

### Development server

```bash
cd medical-clinic-frontend
npm run dev        # http://localhost:3000
```

### Production build

```bash
npm run build      # outputs to dist/
npm run preview    # preview production build locally
```

### Deploy static build

1. Run `npm run build`
2. Upload `dist/` to any static host (Vercel, Netlify, S3 + CloudFront, nginx)
3. Set `VITE_API_URL` to your production API Gateway URL before building

---

## Troubleshooting

### Services fail to start

```bash
# Check Docker is running
docker --version
docker compose version

# Check no port conflicts
# Windows:
netstat -ano | findstr ":8080\|:3306\|:3000"
# Linux/macOS:
lsof -i :8080 -i :3306 -i :3000
```

### MySQL takes too long to initialize

Services depend on MySQL being healthy. If they start before MySQL is ready they will exit and Docker Compose will restart them automatically. Wait 30–60 seconds and run `docker-compose ps` again.

```bash
docker-compose logs mysql-db
```

### "Failed to load appointments" / 500 errors

1. Confirm all containers are running: `docker-compose ps`
2. Confirm the request reaches the gateway: `curl http://localhost:8080/api/auth/login -X POST -H "Content-Type: application/json" -d "{}"` should return 400 (not a network error)
3. Check individual service logs: `docker-compose logs appointment-service`

### Frontend can't reach the backend

```bash
# Test gateway directly
curl http://localhost:8080/api/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

If this returns a JWT token, the backend is healthy. Check `VITE_API_URL` in the frontend `.env` file and look for CORS errors in the browser console.

### Login redirects to internal Docker hostname (ERR_NAME_NOT_RESOLVED)

This happens if Spring Security is misconfigured on a service. All services must have a `SecurityFilterChain` bean with `anyRequest().permitAll()` and stateless session management. Verify `SecurityConfig.java` exists in every service's `config/` package.

---

## Security Considerations

### JWT Secret Key

The default secret key is suitable for local development only. For production, set a strong secret in `common-module/src/main/java/com/medical/clinic/common/security/JwtUtils.java`:

```java
private static final String SECRET_KEY = "<your-256-bit-base64-secret>";
```

Or externalise it via an environment variable.

### Database Password

Change `MYSQL_ROOT_PASSWORD` / `SPRING_DATASOURCE_PASSWORD` in `docker-compose.yml` before any public deployment.

### CORS

The API Gateway is configured to allow `http://localhost:3000` and `http://localhost:5173` in development. Update the allowed origins in `api-gateway/src/main/resources/application.yml` for production.

---

## Database Management

### Backup

```bash
docker-compose exec mysql-db \
  mysqldump -u root -ppassword --all-databases > backup.sql
```

### Restore

```bash
docker-compose exec -T mysql-db \
  mysql -u root -ppassword < backup.sql
```

### Connect directly (GUI or CLI)

Host: `localhost`, Port: `3306`, User: `root`, Password: `password`

Databases: `patient_db`, `appointment_db`, `treatment_db`, `billing_db`

---

## Caching

Appointment data is cached using Spring's **in-memory simple cache** (ConcurrentHashMap). No external cache server is needed.

The cache is invalidated automatically when appointments are created, updated, or deleted. To change the cache implementation (e.g., switch to Redis) update `spring.cache.type` in `appointment-service/src/main/resources/application.yml` and add the corresponding dependency to `appointment-service/pom.xml`.

---

## Maintenance

### Update backend dependencies

```bash
cd medical-clinic-backend
mvn versions:display-dependency-updates
```

### Update frontend dependencies

```bash
cd medical-clinic-frontend
npm outdated
npm update
```

### Prune Docker resources

```bash
docker image prune -f
docker volume prune -f
docker network prune -f
```

---

## Additional Documentation

| File | Contents |
|------|----------|
| `README.md` | Project overview & architecture |
| `SETUP_GUIDE.md` | Step-by-step installation guide |
| `PACKAGE_CONTENTS.md` | Full file tree and feature summary |
| `medical-clinic-backend/README.md` | Backend-specific notes |
| `medical-clinic-frontend/README.md` | Frontend-specific notes |
