import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { patientService } from '@/services/api';
import { toast } from 'sonner';
import type { User } from '@/types';
import { Loader2, Phone, BookOpen } from 'lucide-react';

export default function PatientDoctors() {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await patientService.getAllDoctors();
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Our Doctors</h1>
          <p className="text-muted-foreground">Browse and book appointments with our medical professionals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-sm text-primary font-medium mt-1">{doctor.specialty}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Education</p>
                  <p className="text-sm text-foreground">{doctor.education}</p>
                </div>
                {doctor.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone size={16} className="mr-2" />
                    {doctor.phone}
                  </div>
                )}
              </div>

              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <BookOpen size={18} className="mr-2" />
                Book Appointment
              </Button>
            </Card>
          ))}
        </div>

        {doctors.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No doctors available at the moment</p>
          </Card>
        )}
      </div>
    </Sidebar>
  );
}
