import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { treatmentService, patientService } from '@/services/api';
import { toast } from 'sonner';
import type { TreatmentRecord, User } from '@/types';
import { Loader2, FileText, Calendar, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useParams } from 'wouter';

export default function DoctorPatientHistory() {
  const { user } = useAuth();
  const params = useParams<{ patientId: string }>();
  const [, setLocation] = useLocation();
  const patientId = parseInt(params.patientId);
  const [records, setRecords] = useState<TreatmentRecord[]>([]);
  const [patient, setPatient] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (user?.id) {
          const [histRes, patRes] = await Promise.all([
            treatmentService.getPatientHistoryForDoctor(user.id, patientId),
            patientService.getProfile(patientId),
          ]);
          setRecords(histRes.data);
          setPatient(patRes.data);
        }
      } catch {
        toast.error('Failed to load patient history');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [user?.id, patientId]);

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
          <Button variant="ghost" onClick={() => setLocation('/doctor/patients')} className="mb-4 -ml-2 text-muted-foreground">
            <ArrowLeft size={16} className="mr-2" /> Back to Patients
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Medical History — {patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`}
          </h1>
          <p className="text-muted-foreground">All treatment records for this patient</p>
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
                    <h3 className="font-semibold text-foreground">Record #{record.id}</h3>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Calendar size={12} className="mr-1" />
                      {new Date(record.recordDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Dr. #{record.doctorId}</span>
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
            <p className="text-muted-foreground">No treatment records for this patient</p>
          </Card>
        )}
      </div>
    </Sidebar>
  );
}
