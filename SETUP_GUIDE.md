# Medical Clinic Management System - Setup Guide

This guide will walk you through setting up and running the complete Medical Clinic Management System.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Maven**: [Install Maven](https://maven.apache.org/install.html) (for building backend)
- **Java 17+**: [Install Java](https://www.oracle.com/java/technologies/downloads/)
- **Node.js 18+**: [Install Node.js](https://nodejs.org/)

## Quick Start (5 minutes)

### Step 1: Start the Backend

```bash
cd medical-clinic-backend
mvn clean install -DskipTests
docker-compose up --build
```

Wait for all services to start. You should see messages like:
```
✓ api-gateway is running on port 8080
✓ patient-service is running on port 8081
✓ appointment-service is running on port 8082
✓ treatment-service is running on port 8083
✓ billing-service is running on port 8084
```

### Step 2: Start the Frontend

In a new terminal:

```bash
cd medical-clinic-frontend
npm install --legacy-peer-deps
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Step 3: Login

Use one of the demo credentials:
- **Admin**: username: `admin`, password: `password`
- **Doctor**: username: `doctor`, password: `password`
- **Patient**: username: `patient`, password: `password`

## Detailed Setup Instructions

### Backend Setup

#### 1. Navigate to Backend Directory
```bash
cd medical-clinic-backend
```

#### 2. Build the Project
```bash
mvn clean install -DskipTests
```

This will:
- Download all dependencies
- Compile all microservices
- Build JAR files for each service

#### 3. Start Docker Services
```bash
docker-compose up --build
```

This will:
- Start MySQL database
- Start Redis cache
- Build Docker images for all services
- Start all microservices

#### 4. Verify Services are Running

Check that all services are healthy:
```bash
docker-compose ps
```

You should see all services with status "Up".

#### 5. Test Backend Connectivity

Try accessing the API Gateway:
```bash
curl http://localhost:8080/api/auth/login
```

### Frontend Setup

#### 1. Navigate to Frontend Directory
```bash
cd medical-clinic-frontend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

#### 4. Build for Production
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## System Architecture

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (8080)                     │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┼────────┬────────────┬──────────────┐
    │        │        │            │              │
┌───▼──┐ ┌──▼──┐ ┌───▼────┐ ┌────▼──┐ ┌────────▼─┐
│Patient│ │Appt │ │Treatment│ │Billing│ │  Redis  │
│Service│ │Service│ │Service │ │Service│ │  Cache  │
└───┬──┘ └──┬──┘ └───┬────┘ └────┬──┘ └────────┬─┘
    │       │        │           │             │
    └───────┴────────┴───────────┴─────────────┘
                     │
              ┌──────▼──────┐
              │   MySQL DB  │
              └─────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────┐
│     React Application (3000)        │
├─────────────────────────────────────┤
│  Pages:                             │
│  - Login / Register                 │
│  - Dashboard                        │
│  - Appointments                     │
│  - Medical History                  │
│  - Billing                          │
├─────────────────────────────────────┤
│  Components:                        │
│  - Sidebar Navigation               │
│  - Forms & Dialogs                  │
│  - Cards & Tables                   │
├─────────────────────────────────────┤
│  Services:                          │
│  - API Communication                │
│  - Authentication                   │
│  - State Management                 │
└─────────────────────────────────────┘
         │
         ▼
    API Gateway (8080)
```

## Configuration

### Backend Configuration

Each service has an `application.yml` file in `src/main/resources/`:

**Database Configuration**
```yaml
spring:
  datasource:
    url: jdbc:mysql://mysql-db:3306/service_db
    username: root
    password: password
```

**Redis Configuration** (Appointment Service)
```yaml
spring:
  data:
    redis:
      host: redis
      port: 6379
  cache:
    type: redis
    redis:
      time-to-live: 600000
```

### Frontend Configuration

API base URL in `client/src/services/api.ts`:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
```

## Testing the System

### 1. Test Patient Registration

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newpatient",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "age": 30
  }'
```

### 2. Test Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "patient",
    "password": "password"
  }'
```

### 3. Test Get Doctors List

```bash
curl -X GET http://localhost:8080/api/patients/doctors \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Book Appointment

```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patientId": 1,
    "doctorId": 2,
    "appointmentTime": "2026-05-01T10:00:00"
  }'
```

## Troubleshooting

### Backend Won't Start

**Problem**: Services fail to start
**Solution**:
1. Check if ports 8080-8084 are available
2. Ensure Docker is running: `docker --version`
3. Check Docker logs: `docker-compose logs`
4. Restart Docker: `docker-compose down && docker-compose up --build`

### Database Connection Error

**Problem**: "Cannot connect to database"
**Solution**:
1. Wait 30 seconds for MySQL to fully initialize
2. Check MySQL container: `docker-compose ps mysql-db`
3. Verify credentials in `application.yml`

### Frontend Can't Connect to Backend

**Problem**: "Failed to fetch" errors in browser console
**Solution**:
1. Verify backend is running: `curl http://localhost:8080/api/auth/login`
2. Check API base URL in `services/api.ts`
3. Check browser console for CORS errors
4. Restart frontend: `npm run dev`

### Redis Cache Issues

**Problem**: Appointment Service fails to connect to Redis
**Solution**:
1. Check Redis container: `docker-compose ps redis`
2. Verify Redis is running: `docker-compose logs redis`
3. Restart Redis: `docker-compose restart redis`

## Stopping the System

### Stop Backend
```bash
cd medical-clinic-backend
docker-compose down
```

### Stop Frontend
Press `Ctrl+C` in the terminal running `npm run dev`

## Production Deployment

### Using Docker

1. Build production images:
```bash
docker-compose -f docker-compose.yml build
```

2. Push to Docker registry:
```bash
docker tag medical-clinic-backend:latest your-registry/medical-clinic-backend:latest
docker push your-registry/medical-clinic-backend:latest
```

3. Deploy to production server:
```bash
docker-compose -f docker-compose.yml up -d
```

### Environment Variables

Create a `.env` file for production:
```
MYSQL_ROOT_PASSWORD=your-secure-password
REDIS_PASSWORD=your-redis-password
JWT_SECRET=your-jwt-secret-key
API_BASE_URL=https://your-domain.com/api
```

## Next Steps

1. **Customize**: Modify the color palette and branding
2. **Add Features**: Implement additional functionality
3. **Security**: Update JWT secret and database credentials
4. **Monitoring**: Set up logging and monitoring
5. **Testing**: Write unit and integration tests
6. **Documentation**: Update API documentation

## Support

For detailed information, see:
- Backend README: `medical-clinic-backend/README.md`
- Frontend README: `medical-clinic-frontend/README.md`
- Main README: `README.md`
