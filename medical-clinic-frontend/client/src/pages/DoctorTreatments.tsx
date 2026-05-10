import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { treatmentService, patientService } from '@/services/api';
import { toast } from 'sonner';
import type { TreatmentRecord, User } from '@/types';
import { Loader2, Plus, FileText, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DoctorTreatments() {
  const { user } = useAuth();
  const [records, setRecords] = useState<TreatmentRecord[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    prescription: '',
    procedures: '',
  });

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      if (user?.id) {
        const [recordsRes, patientsRes] = await Promise.all([
          treatmentService.getDoctorRecords(user.id),
          patientService.getAllPatients(),
        ]);
        setRecords(recordsRes.data);
        setPatients(patientsRes.data);
      }
    } catch {
      toast.error('Failed to load treatment records');
    } finally {
      setIsLoading(false);
    }
  };

  const patientName = (id: number) => {
    const p = patients.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : `#${id}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patientId = parseInt(formData.patientId);
      await treatmentService.createRecord({
        patientId,
        doctorId: user?.id,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        procedures: formData.procedures,
      });
      toast.success('Treatment record saved');
      setIsDialogOpen(false);
      setFormData({ patientId: '', diagnosis: '', prescription: '', procedures: '' });
      fetchData();
    } catch {
      toast.error('Failed to save treatment record');
    }
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Treatments</h1>
            <p className="text-muted-foreground">Manage patient treatment records</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={18} className="mr-2" /> New Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Treatment Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Patient</label>
                  <select
                    className="w-full border border-input rounded-md px-3 py-2 bg-background text-foreground text-sm"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    required
                  >
                    <option value="">Select patient...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Diagnosis</label>
                  <Input
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Prescription</label>
                  <Input
                    value={formData.prescription}
                    onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                    placeholder="Enter prescription"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Procedures</label>
                  <Input
                    value={formData.procedures}
                    onChange={(e) => setFormData({ ...formData, procedures: e.target.value })}
                    placeholder="Enter procedures performed"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground">Save Record</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{patientName(record.patientId)}</h3>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Calendar size={12} className="mr-1" />
                      {new Date(record.recordDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Diagnosis</p>
                  <p className="text-sm text-foreground">{record.diagnosis || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Prescription</p>
                  <p className="text-sm text-foreground">{record.prescription || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Procedures</p>
                  <p className="text-sm text-foreground">{record.procedures || '—'}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {records.length === 0 && (
          <Card className="p-12 text-center">
            <FileText size={40} className="text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No treatment records yet</p>
          </Card>
        )}
      </div>
    </Sidebar>
  );
}
