import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { patientService } from '@/services/api';
import { toast } from 'sonner';
import type { User } from '@/types';
import { Loader2, Plus, Phone, BookOpen, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', password: '',
    specialty: '', education: '', phone: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [docRes, reqRes] = await Promise.all([
        patientService.getAllDoctors(),
        patientService.getPendingChangeRequests(),
      ]);
      setDoctors(docRes.data);
      setPendingRequests(reqRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patientService.addDoctor(formData);
      toast.success('Doctor added');
      setIsDialogOpen(false);
      setFormData({ firstName: '', lastName: '', username: '', password: '', specialty: '', education: '', phone: '' });
      fetchAll();
    } catch {
      toast.error('Failed to add doctor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this doctor?')) return;
    try {
      await patientService.deleteDoctor(id);
      toast.success('Doctor deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete doctor');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await patientService.approveChange(id);
      toast.success('Changes approved');
      fetchAll();
    } catch {
      toast.error('Failed to approve changes');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await patientService.rejectChange(id);
      toast.success('Changes rejected');
      fetchAll();
    } catch {
      toast.error('Failed to reject changes');
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
        {/* Pending change requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Pending Profile Change Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-3">
              {pendingRequests.map((doc) => {
                const changes = doc.pendingChanges ? JSON.parse(doc.pendingChanges) : {};
                return (
                  <Card key={doc.id} className="p-4 border-orange-200 bg-orange-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          Dr. {doc.firstName} {doc.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Requested changes:</p>
                        <ul className="text-sm mt-1 space-y-0.5">
                          {Object.entries(changes).map(([key, val]) => (
                            <li key={key} className="text-foreground">
                              <span className="font-medium capitalize">{key}:</span> {String(val)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" onClick={() => handleApprove(doc.id)} className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle size={14} className="mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(doc.id)} className="border-red-300 text-red-600 hover:bg-red-50">
                          <XCircle size={14} className="mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Doctors list */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Doctors</h1>
            <p className="text-muted-foreground">Manage the clinic's medical staff</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={18} className="mr-2" /> Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Doctor</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="First name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Last name" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Username" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Password" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Specialty</label>
                  <Input value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} placeholder="e.g. Cardiology" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Education</label>
                  <Input value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} placeholder="e.g. MD, Harvard" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone number" />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground">Add Doctor</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-sm text-primary font-medium mt-1">{doctor.specialty}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(doctor.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 -mt-1">
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="space-y-2">
                {doctor.education && (
                  <div className="flex items-start text-sm text-muted-foreground">
                    <BookOpen size={14} className="mr-2 mt-0.5 shrink-0" /> {doctor.education}
                  </div>
                )}
                {doctor.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone size={14} className="mr-2" /> {doctor.phone}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {doctors.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No doctors registered yet</p>
          </Card>
        )}
      </div>
    </Sidebar>
  );
}
