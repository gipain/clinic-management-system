import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { treatmentService } from '@/services/api';
import { toast } from 'sonner';
import type { TreatmentRecord } from '@/types';
import { Loader2, FileText, Calendar, Stethoscope } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PatientHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState<TreatmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (user?.id) {
          const response = await treatmentService.getPatientHistory(user.id);
          setRecords(response.data);
        }
      } catch {
        toast.error('Failed to load medical history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user?.id]);

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Medical History</h1>
          <p className="text-muted-foreground">Your complete treatment records</p>
        </div>

        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Stethoscope size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Treatment Record #{record.id}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Calendar size={12} className="mr-1" />
                      {new Date(record.recordDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Doctor #{record.doctorId}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
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
            <p className="text-muted-foreground">No medical records on file yet</p>
          </Card>
        )}
      </div>
    </Sidebar>
  );
}
