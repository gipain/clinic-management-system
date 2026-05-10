export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  age?: number;
  phone?: string;
  education?: string;
  specialty?: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentTime: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
}

export interface TreatmentRecord {
  id: number;
  patientId: number;
  doctorId: number;
  diagnosis: string;
  prescription: string;
  procedures: string;
  recordDate: string;
}

export interface Payment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  amount: number;
  serviceType: string;
  paymentDate: string;
  status: 'PENDING' | 'PAID';
  paymentMethod?: 'ONLINE' | 'CASH' | null;
}

export interface Doctor extends User {
  role: 'DOCTOR';
  specialty: string;
  education: string;
}

export interface Patient extends User {
  role: 'PATIENT';
  age: number;
}
