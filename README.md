# Medical Clinic Management System - Complete Solution

A comprehensive microservices-based Medical Clinic Management System with a modern React frontend and Spring Boot backend.

## Project Structure

```
medical-clinic-system/
├── medical-clinic-backend/          # Spring Boot microservices backend
│   ├── api-gateway/                 # API Gateway (Port 8080)
│   ├── patient-service/             # Patient Service (Port 8081)
│   ├── appointment-service/         # Appointment Service with Redis (Port 8082)
│   ├── treatment-service/           # Treatment Service (Port 8083)
│   ├── billing-service/             # Billing Service (Port 8084)
│   ├── common-module/               # Shared utilities and security
│   ├── docker-compose.yml           # Docker orchestration
│   └── pom.xml                      # Maven parent POM
│
└── medical-clinic-frontend/         # React frontend
    ├── client/
    │   ├── src/
    │   │   ├── pages/               # Page components
    │   │   ├── components/          # Reusable components
    │   │   ├── services/            # API service layer
    │   │   ├── contexts/            # React contexts
    │   │   ├── types/               # TypeScript types
    │   │   └── App.tsx              # Main app component
    │   ├── index.html               # HTML entry point
    │   └── package.json             # Frontend dependencies
    └── server/                      # Express server for production
```

## Features

### Backend (Spring Boot Microservices)

**Authentication & Authorization**
- JWT-based authentication with role-based access control (RBAC)
- Three roles: ADMIN, DOCTOR, PATIENT
- Secure password handling with BCrypt

**Microservices**
- **Patient Service**: User registration, profile management, authentication
- **Appointment Service**: Scheduling, calendar management, approval workflows with Redis caching
- **Treatment Service**: Medical records, diagnoses, prescriptions, treatment history
- **Billing Service**: Cost calculation, payment processing, invoice management
- **API Gateway**: Central routing and request handling

**Infrastructure**
- MySQL databases (one per service)
- Redis caching for performance optimization
- Docker containerization for all services
- Docker Compose for orchestration

### Frontend (React + TypeScript)

**User Interface**
- Modern, clean design with Light Blue and White color palette
- Responsive layout (mobile, tablet, desktop)
- Role-based dashboards for Admin, Doctor, and Patient

**Pages & Features**
- **Authentication**: Login and registration pages
- **Dashboard**: Role-specific overview with quick stats
- **Appointment Management**: Book, view, and manage appointments
- **Medical History**: Access treatment records and prescriptions
- **Billing**: View invoices and process payments
- **Doctor Directory**: Browse available doctors (for patients)

**Technology Stack**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- shadcn/ui components
- Wouter for routing
- Axios for API communication
- Sonner for toast notifications

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Maven 3.8+
- Node.js 18+
- Java 17+

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd medical-clinic-backend
   ```

2. Build all services:
   ```bash
   mvn clean install -DskipTests
   ```

3. Start the entire stack with Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. Services will be available at:
   - API Gateway: `http://localhost:8080`
   - Patient Service: `http://localhost:8081`
   - Appointment Service: `http://localhost:8082`
   - Treatment Service: `http://localhost:8083`
   - Billing Service: `http://localhost:8084`

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd medical-clinic-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new patient
- `POST /api/auth/login` - User login
- `POST /api/auth/recover` - Password recovery

### Patient Management
- `GET /api/patients/doctors` - Get all doctors
- `GET /api/patients/{id}` - Get user profile
- `POST /api/patients/doctors` - Add new doctor (Admin only)

### Appointments
- `GET /api/appointments/doctor/{doctorId}` - Get doctor's calendar
- `POST /api/appointments` - Book appointment
- `PATCH /api/appointments/{id}/status` - Update appointment status

### Treatment Records
- `GET /api/treatments/patient/{patientId}` - Get patient history
- `GET /api/treatments/doctor/{doctorId}` - Get doctor's records
- `POST /api/treatments` - Create treatment record

### Billing
- `POST /api/billing/calculate` - Calculate bill
- `GET /api/billing/patient/{patientId}` - Get patient bills
- `POST /api/billing/{id}/pay` - Process payment

## Demo Credentials

Use these credentials to test the system:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | password |
| Doctor | doctor | password |
| Patient | patient | password |

## Database Schema

The system uses separate MySQL databases for each service:
- `patient_db` - User and authentication data
- `appointment_db` - Appointment and calendar data
- `treatment_db` - Medical records and treatment data
- `billing_db` - Payment and invoice data

## Caching Strategy

**Redis Caching** is implemented in the Appointment Service:
- Doctor calendars are cached for 10 minutes
- Cache is invalidated when appointments are created or updated
- Reduces database load for frequently accessed calendar data

## Security Features

- JWT token-based authentication
- Role-based access control (RBAC)
- Password encryption with BCrypt
- API Gateway request routing and validation
- Secure database connections

## Deployment

### Docker Deployment

The entire system can be deployed using Docker Compose:

```bash
cd medical-clinic-backend
docker-compose up -d
```

This will start:
- MySQL database server
- Redis cache server
- All five microservices
- API Gateway

### Production Considerations

1. Update JWT secret key in `JwtUtils.java`
2. Configure database credentials in `application.yml` files
3. Set up SSL/TLS for secure communication
4. Implement proper logging and monitoring
5. Configure backup and recovery procedures
6. Use environment variables for sensitive data

## Development Workflow

### Backend Development
1. Make changes to service code
2. Rebuild the specific service: `mvn clean install -DskipTests`
3. Restart the service container: `docker-compose up --build service-name`

### Frontend Development
1. Changes are automatically hot-reloaded in development mode
2. Run `npm run build` to create production build
3. Run `npm run check` to verify TypeScript

## Troubleshooting

### Backend Issues

**Services won't start**
- Check if ports 8080-8084 are available
- Verify Docker and Docker Compose are installed
- Check Docker logs: `docker-compose logs service-name`

**Database connection errors**
- Ensure MySQL container is running: `docker-compose ps`
- Verify database credentials in `application.yml`

### Frontend Issues

**API connection errors**
- Ensure backend services are running on correct ports
- Check browser console for CORS errors
- Verify API base URL in `services/api.ts`

**Build errors**
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Future Enhancements

- Real-time notifications using WebSockets
- Video consultation integration
- Advanced reporting and analytics
- Mobile app (React Native)
- AI-powered diagnosis assistance
- Integration with third-party payment gateways
- Multi-language support
- Advanced scheduling with availability management

## License

This project is provided as-is for educational and commercial use.

## Support

For issues or questions, please refer to the individual README files in the backend and frontend directories.
