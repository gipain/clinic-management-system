import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { appointmentService, patientService, billingService } from '@/services/api';
import { toast } from 'sonner';
import type { Appointment, User } from '@/types';
import { Loader2, Trash2, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';

const STATUS_OPTIONS: Appointment['status'][] = ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED'];

const badgeClass: Record<string, string> = {
  PENDING_APPROVAL: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({ patientId: '', doctorId: '', appointmentTime: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [apptRes, docRes, patRes] = await Promise.all([
        appointmentService.getAllAppointments(),
        patientService.getAllDoctors(),
        patientService.getAllPatients(),
      ]);
      setAppointments(apptRes.data);
      setDoctors(docRes.data);
      setPatients(patRes.data);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appointmentService.bookAppointment({
        patientId: parseInt(form.patientId),
        doctorId: parseInt(form.doctorId),
        appointmentTime: form.appointmentTime,
      });
      toast.success('Appointment created');
      setIsDialogOpen(false);
      setForm({ patientId: '', doctorId: '', appointmentTime: '' });
      fetchAll();
    } catch {
      toast.error('Failed to create appointment');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await appointmentService.updateStatus(id, status);

      // Auto-create bill when admin marks appointment as COMPLETED
      if (status === 'COMPLETED') {
        const appt = appointments.find((a) => a.id === id);
        if (appt) {
          await billingService.createBill(appt.patientId, appt.doctorId, appt.id, 'Medical Consultation');
          toast.success('Status updated — bill sent to patient');
        } else {
          toast.success('Status updated');
        }
      } else {
        toast.success('Status updated');
      }

      fetchAll();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this appointment?')) return;
    try {
      await appointmentService.deleteAppointment(id);
      toast.success('Appointment deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete appointment');
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'APPROVED') return <CheckCircle size={16} className="text-green-500" />;
    if (status === 'REJECTED') return <XCircle size={16} className="text-red-500" />;
    return <Clock size={16} className="text-orange-500" />;
  };

  const patientName = (id: number) => {
    const p = patients.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : `#${id}`;
  };

  const doctorName = (id: number) => {
    const d = doctors.find((x) => x.id === id);
    return d ? `Dr. ${d.firstName} ${d.lastName}` : `#${id}`;
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
            <p className="text-muted-foreground">Manage all clinic appointments</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={18} className="mr-2" /> New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Appointment</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Patient</label>
                  <select
                    className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground text-sm"
                    value={form.patientId}
                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    required
                  >
                    <option value="">Select patient...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} (@{p.username})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Doctor</label>
                  <select
                    className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground text-sm"
                    value={form.doctorId}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                    required
                  >
                    <option value="">Select doctor...</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.firstName} {d.lastName}{d.specialty ? ` — ${d.specialty}` : ''}
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
                  Create Appointment
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
                  <th className="text-left py-3 px-4 font-medium text-foreground">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Doctor</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id} className="border-b border-border hover:bg-secondary">
                    <td className="py-3 px-4 text-muted-foreground text-sm">#{appt.id}</td>
                    <td className="py-3 px-4 text-foreground text-sm">{patientName(appt.patientId)}</td>
                    <td className="py-3 px-4 text-foreground text-sm">{doctorName(appt.doctorId)}</td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {new Date(appt.appointmentTime).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(appt.status)}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass[appt.status] || 'bg-gray-100 text-gray-800'}`}>
                          {appt.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          className="text-xs border border-input rounded px-2 py-1 bg-background"
                          value={appt.status}
                          onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(appt.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {appointments.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No appointments found</p>
          )}
        </Card>
      </div>
    </Sidebar>
  );
}
