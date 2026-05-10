import axios, { AxiosInstance } from 'axios';
import type { AuthResponse, User, Appointment, TreatmentRecord, Payment } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (username: string, password: string, firstName: string, lastName: string, age: number) =>
    api.post<AuthResponse>('/auth/register', { username, password, firstName, lastName, age }),

  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }),

  recoverPassword: (username: string) =>
    api.post('/auth/recover', { username }),
};

export const patientService = {
  getAllDoctors: () =>
    api.get<User[]>('/patients/doctors'),

  addDoctor: (doctor: Partial<User> & { password?: string }) =>
    api.post<User>('/patients/doctors', doctor),

  deleteDoctor: (id: number) =>
    api.delete(`/patients/doctors/${id}`),

  getAllPatients: () =>
    api.get<User[]>('/patients/all'),

  deletePatient: (id: number) =>
    api.delete(`/patients/${id}`),

  getProfile: (id: number) =>
    api.get<User>(`/patients/${id}`),

  updateProfile: (id: number, updates: Partial<User>) =>
    api.put<User>(`/patients/${id}`, updates),

  requestProfileChange: (id: number, proposed: Partial<User>) =>
    api.post(`/patients/${id}/request-change`, proposed),

  getPendingChangeRequests: () =>
    api.get<User[]>('/patients/change-requests'),

  approveChange: (id: number) =>
    api.put<User>(`/patients/${id}/approve-change`),

  rejectChange: (id: number) =>
    api.put<User>(`/patients/${id}/reject-change`),
};

export const appointmentService = {
  getAllAppointments: () =>
    api.get<Appointment[]>('/appointments/all'),

  getDoctorCalendar: (doctorId: number) =>
    api.get<Appointment[]>(`/appointments/doctor/${doctorId}`),

  getPatientAppointments: (patientId: number) =>
    api.get<Appointment[]>(`/appointments/patient/${patientId}`),

  bookAppointment: (appointment: Partial<Appointment>) =>
    api.post<Appointment>('/appointments', appointment),

  updateStatus: (id: number, status: string) =>
    api.patch<Appointment>(`/appointments/${id}/status`, null, { params: { status } }),

  deleteAppointment: (id: number) =>
    api.delete(`/appointments/${id}`),
};

export const treatmentService = {
  getPatientHistory: (patientId: number) =>
    api.get<TreatmentRecord[]>(`/treatments/patient/${patientId}`),

  getDoctorRecords: (doctorId: number) =>
    api.get<TreatmentRecord[]>(`/treatments/doctor/${doctorId}`),

  getPatientHistoryForDoctor: (doctorId: number, patientId: number) =>
    api.get<TreatmentRecord[]>(`/treatments/doctor/${doctorId}/patient/${patientId}`),

  createRecord: (record: Partial<TreatmentRecord>) =>
    api.post<TreatmentRecord>('/treatments', record),
};

export const billingService = {
  getAllBills: () =>
    api.get<Payment[]>('/billing/all'),

  getPatientBills: (patientId: number) =>
    api.get<Payment[]>(`/billing/patient/${patientId}`),

  getDoctorBills: (doctorId: number) =>
    api.get<Payment[]>(`/billing/doctor/${doctorId}`),

  createBill: (patientId: number, doctorId: number, appointmentId?: number, serviceType?: string) =>
    api.post<Payment>('/billing/create', { patientId, doctorId, appointmentId, serviceType }),

  payOnline: (id: number, card: { cardNumber: string; expiry: string; cvv: string }) =>
    api.post<Payment>(`/billing/${id}/pay-online`, card),

  payCash: (id: number) =>
    api.post<Payment>(`/billing/${id}/pay-cash`),

  deleteBill: (id: number) =>
    api.delete(`/billing/${id}`),
};

export default api;
