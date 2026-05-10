import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { patientService, appointmentService } from '@/services/api';
import { toast } from 'sonner';
import type { User } from '@/types';
import { Loader2, Phone, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PatientDoctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // booking dialog state
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await patientService.getAllDoctors();
      setDoctors(response.data);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (doctor: User) => {
    setSelectedDoctor(doctor);
    setAppointmentTime('');
  };

  const closeDialog = () => {
    setSelectedDoctor(null);
    setAppointmentTime('');
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !user) return;
    setIsBooking(true);
    try {
      await appointmentService.bookAppointment({
        patientId: user.id,
        doctorId: selectedDoctor.id,
        appointmentTime,
      });
      toast.success(`Appointment booked with Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`);
      closeDialog();
    } catch {
      toast.error('Failed to book appointment');
    } finally {
      setIsBooking(false);
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
            <Card key={doctor.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-sm text-primary font-medium mt-1">{doctor.specialty}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Education</p>
                  <p className="text-sm text-foreground">{doctor.education || '—'}</p>
                </div>
                {doctor.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone size={16} className="mr-2" />
                    {doctor.phone}
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => openDialog(doctor)}
              >
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

      {/* Booking dialog */}
      <Dialog open={!!selectedDoctor} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Book Appointment
              {selectedDoctor && (
                <span className="font-normal text-muted-foreground text-base ml-2">
                  — Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  {selectedDoctor.specialty ? ` (${selectedDoctor.specialty})` : ''}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBook} className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date &amp; Time</label>
              <Input
                type="datetime-local"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground"
                disabled={isBooking}
              >
                {isBooking ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Confirm Booking
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
