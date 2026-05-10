import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { appointmentService, patientService, billingService } from '@/services/api';
import { toast } from 'sonner';
import type { Appointment, User } from '@/types';
import { Loader2, Plus, Clock, CheckCircle, XCircle, CircleCheck, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ doctorId: '', appointmentTime: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      if (user?.role === 'DOCTOR') {
        const [apptRes, patientsRes] = await Promise.all([
          appointmentService.getDoctorCalendar(user.id),
          patientService.getAllPatients(),
        ]);
        setAppointments(apptRes.data);
        setPatients(patientsRes.data);
      } else if (user?.role === 'PATIENT') {
        const [apptRes, docRes] = await Promise.all([
          appointmentService.getPatientAppointments(user.id),
          patientService.getAllDoctors(),
        ]);
        setAppointments(apptRes.data);
        setDoctors(docRes.data);
      }
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const resolvePatientName = (id: number) => {
    const p = patients.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${id}`;
  };

  const resolveDoctorName = (id: number) => {
    const d = doctors.find((x) => x.id === id);
    return d ? `Dr. ${d.firstName} ${d.lastName}` : `Dr. #${id}`;
  };

  // Mark appointment COMPLETED and auto-create bill
  const handleComplete = async (appt: Appointment) => {
    try {
      await appointmentService.updateStatus(appt.id, 'COMPLETED');
      await billingService.createBill(
        appt.patientId,
        appt.doctorId,
        appt.id,
        'Medical Consultation',
      );
      toast.success('Appointment completed — bill sent to patient');
      fetchData();
    } catch {
      toast.error('Failed to complete appointment');
    }
  };

  const handleApprove = async (appt: Appointment) => {
    try {
      await appointmentService.updateStatus(appt.id, 'APPROVED');
      toast.success('Appointment approved');
      fetchData();
    } catch {
      toast.error('Failed to approve appointment');
    }
  };

  const handleReject = async (appt: Appointment) => {
    try {
      await appointmentService.updateStatus(appt.id, 'REJECTED');
      toast.success('Appointment rejected');
      fetchData();
    } catch {
      toast.error('Failed to reject appointment');
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appointmentService.bookAppointment({
        patientId: user!.id,
        doctorId: parseInt(formData.doctorId),
        appointmentTime: formData.appointmentTime,
      });
      toast.success('Appointment booked successfully');
      setIsDialogOpen(false);
      setFormData({ doctorId: '', appointmentTime: '' });
      fetchData();
    } catch {
      toast.error('Failed to book appointment');
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'APPROVED')   return <CheckCircle size={18} className="text-green-500" />;
    if (status === 'REJECTED')   return <XCircle size={18} className="text-red-500" />;
    if (status === 'COMPLETED')  return <CircleCheck size={18} className="text-blue-500" />;
    return <Clock size={18} className="text-orange-500" />;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING_APPROVAL: 'bg-orange-100 text-orange-800',
      APPROVED:         'bg-green-100 text-green-800',
      REJECTED:         'bg-red-100 text-red-800',
      COMPLETED:        'bg-blue-100 text-blue-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Appointments</h1>
            <p className="text-muted-foreground">
              {user?.role === 'PATIENT' ? 'Your scheduled appointments' : 'Your patient appointments'}
            </p>
          </div>

          {user?.role === 'PATIENT' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus size={18} className="mr-2" /> Book Appointment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Book New Appointment</DialogTitle></DialogHeader>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Select Doctor</label>
                    <select
                      className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground text-sm"
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                      required
                    >
                      <option value="">Choose a doctor...</option>
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          Dr. {doc.firstName} {doc.lastName}{doc.specialty ? ` — ${doc.specialty}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground">
                    Confirm Booking
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="space-y-4">
          {appointments.map((appt) => (
            <Card key={appt.id} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(appt.status)}
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {user?.role === 'DOCTOR'
                        ? resolvePatientName(appt.patientId)
                        : resolveDoctorName(appt.doctorId)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appt.appointmentTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(appt.status)}`}>
                    {appt.status.replace('_', ' ')}
                  </span>

                  {/* Doctor: approve / reject pending appointments */}
                  {user?.role === 'DOCTOR' && appt.status === 'PENDING_APPROVAL' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(appt)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ThumbsUp size={14} className="mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(appt)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <ThumbsDown size={14} className="mr-1" /> Reject
                      </Button>
                    </>
                  )}

                  {/* Doctor: mark approved appointment as completed */}
                  {user?.role === 'DOCTOR' && appt.status === 'APPROVED' && (
                    <Button
                      size="sm"
                      onClick={() => handleComplete(appt)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CircleCheck size={14} className="mr-1" /> Complete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {appointments.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No appointments scheduled</p>
          </Card>
        )}
      </div>
    </Sidebar>
  );
}
