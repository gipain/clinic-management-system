import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { appointmentService, patientService } from '@/services/api';
import { toast } from 'sonner';
import type { Appointment, User } from '@/types';
import { Loader2, User as UserIcon, FileText, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

interface PatientSummary {
  id: number;
  appointmentCount: number;
  lastAppointment: string;
}

export default function DoctorPatients() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allPatients, setAllPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({ patientId: '', appointmentTime: '' });

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      if (user?.id) {
        const [apptRes, patientsRes] = await Promise.all([
          appointmentService.getDoctorCalendar(user.id),
          patientService.getAllPatients(),
        ]);
        setAppointments(apptRes.data);
        setAllPatients(patientsRes.data);
      }
    } catch {
      toast.error('Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const patientName = (id: number) => {
    const p = allPatients.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : `#${id}`;
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appointmentService.bookAppointment({
        patientId: parseInt(form.patientId),
        doctorId: user!.id,
        appointmentTime: form.appointmentTime,
      });
      toast.success('Appointment booked');
      setIsDialogOpen(false);
      setForm({ patientId: '', appointmentTime: '' });
      fetchData();
    } catch {
      toast.error('Failed to book appointment');
    }
  };

  const uniquePatients: PatientSummary[] = Object.values(
    appointments.reduce((acc, appt) => {
      if (!acc[appt.patientId]) {
        acc[appt.patientId] = { id: appt.patientId, appointmentCount: 0, lastAppointment: appt.appointmentTime };
      }
      acc[appt.patientId].appointmentCount++;
      if (appt.appointmentTime > acc[appt.patientId].lastAppointment) {
        acc[appt.patientId].lastAppointment = appt.appointmentTime;
      }
      return acc;
    }, {} as Record<number, PatientSummary>)
  );

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
            <h1 className="text-3xl font-bold text-foreground mb-2">My Patients</h1>
            <p className="text-muted-foreground">Patients with appointments scheduled with you</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={18} className="mr-2" /> Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                The appointment will be booked with you as the doctor.
              </p>
              <form onSubmit={handleBookAppointment} className="space-y-4 mt-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Patient</label>
                  <select
                    className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground text-sm"
                    value={form.patientId}
                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    required
                  >
                    <option value="">Select patient...</option>
                    {allPatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} (@{p.username})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={form.appointmentTime}
                    onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground">
                  Confirm Booking
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Appointments</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Last Visit</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uniquePatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-border hover:bg-secondary">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserIcon size={16} className="text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{patientName(patient.id)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {patient.appointmentCount} visit{patient.appointmentCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(patient.lastAppointment).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/doctor/patients/${patient.id}/history`)}
                      >
                        <FileText size={14} className="mr-1" /> View History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {uniquePatients.length === 0 && (
            <div className="text-center py-12">
              <UserIcon size={40} className="text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No patients yet — book an appointment to get started</p>
            </div>
          )}
        </Card>
      </div>
    </Sidebar>
  );
}
