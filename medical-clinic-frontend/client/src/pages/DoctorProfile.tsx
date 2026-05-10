import { useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { patientService } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserIcon, Edit2, Clock } from 'lucide-react';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    specialty: user?.specialty || '',
    education: user?.education || '',
    phone: user?.phone || '',
  });
  const hasPending = !!(user as any)?.pendingChanges;

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await patientService.requestProfileChange(user.id, form);
      toast.success('Change request submitted — awaiting admin approval');
      setIsDialogOpen(false);
    } catch {
      toast.error('Failed to submit change request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sidebar>
      <div className="p-6 md:p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Profile changes require admin approval</p>
        </div>

        {hasPending && (
          <Card className="p-4 mb-6 border-orange-200 bg-orange-50">
            <div className="flex items-center gap-2 text-orange-700">
              <Clock size={18} />
              <p className="text-sm font-medium">You have a pending profile change request awaiting admin approval.</p>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <UserIcon size={32} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Dr. {user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-primary font-medium">{user?.specialty}</p>
                <p className="text-xs text-muted-foreground">{user?.username}</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={hasPending}>
                  <Edit2 size={16} className="mr-2" />
                  {hasPending ? 'Request Pending' : 'Request Change'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Profile Change</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Your request will be reviewed by an administrator before taking effect.
                </p>
                <form onSubmit={handleRequestChange} className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Specialty</label>
                    <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Education</label>
                    <Input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground">
                    {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">First Name</p>
                <p className="text-foreground">{user?.firstName || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Last Name</p>
                <p className="text-foreground">{user?.lastName || '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Specialty</p>
              <p className="text-foreground">{user?.specialty || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Education</p>
              <p className="text-foreground">{user?.education || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
              <p className="text-foreground">{user?.phone || '—'}</p>
            </div>
          </div>
        </Card>
      </div>
    </Sidebar>
  );
}
