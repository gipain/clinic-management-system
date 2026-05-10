import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { patientService } from '@/services/api';
import { toast } from 'sonner';
import type { User } from '@/types';
import { Loader2, Phone, User as UserIcon, Trash2 } from 'lucide-react';

export default function AdminPatients() {
  const [patients, setPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      const res = await patientService.getAllPatients();
      setPatients(res.data);
    } catch {
      toast.error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await patientService.deletePatient(id);
      toast.success('Patient deleted');
      fetchPatients();
    } catch {
      toast.error('Failed to delete patient');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Patients</h1>
          <p className="text-muted-foreground">Manage registered patients</p>
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Username</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Age</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-border hover:bg-secondary">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserIcon size={16} className="text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{patient.firstName} {patient.lastName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{patient.username}</td>
                    <td className="py-3 px-4 text-muted-foreground">{patient.age ?? '—'}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {patient.phone ? (
                        <span className="flex items-center"><Phone size={14} className="mr-1" />{patient.phone}</span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(patient.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {patients.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No patients registered yet</p>
          )}
        </Card>
      </div>
    </Sidebar>
  );
}
