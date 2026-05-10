import { useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { patientService } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserIcon, Edit2, Save, X } from 'lucide-react';

export default function PatientProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    age: user?.age?.toString() || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await patientService.updateProfile(user.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        age: form.age ? parseInt(form.age) : undefined,
        phone: form.phone,
      });
      updateUser(res.data);
      toast.success('Profile updated');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      age: user?.age?.toString() || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <Sidebar>
      <div className="p-6 md:p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">View and update your personal information</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <UserIcon size={32} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-muted-foreground">{user?.username} · {user?.role}</p>
              </div>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} className="mr-2" /> Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">First Name</label>
                {isEditing
                  ? <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  : <p className="text-foreground py-2">{user?.firstName || '—'}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Last Name</label>
                {isEditing
                  ? <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                  : <p className="text-foreground py-2">{user?.lastName || '—'}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Username</label>
              <p className="text-foreground py-2 text-muted-foreground">{user?.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Age</label>
              {isEditing
                ? <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                : <p className="text-foreground py-2">{user?.age ?? '—'}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
              {isEditing
                ? <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" />
                : <p className="text-foreground py-2">{user?.phone || '—'}</p>}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground">
                <Save size={16} className="mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X size={16} className="mr-2" /> Cancel
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Sidebar>
  );
}
