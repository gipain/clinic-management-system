import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { billingService, patientService } from '@/services/api';
import { toast } from 'sonner';
import type { Payment, User } from '@/types';
import { Loader2, CheckCircle, CreditCard, Banknote } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DoctorBilling() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Payment[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchData(); }, [user?.id]);

  const fetchData = async () => {
    try {
      if (user?.id) {
        const [billsRes, patientsRes] = await Promise.all([
          billingService.getDoctorBills(user.id),
          patientService.getAllPatients(),
        ]);
        setBills(billsRes.data);
        setPatients(patientsRes.data);
      }
    } catch {
      toast.error('Failed to load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  const patientName = (id: number) => {
    const p = patients.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${id}`;
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await billingService.payCash(id);
      toast.success('Marked as paid (cash)');
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update payment');
    }
  };

  const pending = bills.filter(b => b.status === 'PENDING');
  const paid    = bills.filter(b => b.status === 'PAID');

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Patient Billing</h1>
          <p className="text-muted-foreground">Mark cash payments for your patients</p>
        </div>

        {/* Pending bills */}
        {pending.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Pending ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((bill) => (
                <Card key={bill.id} className="p-4 border-orange-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <CreditCard size={18} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{patientName(bill.patientId)}</p>
                        <p className="text-sm text-muted-foreground">
                          {bill.serviceType} · {new Date(bill.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-foreground">₴{bill.amount.toFixed(2)}</p>
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(bill.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Banknote size={14} className="mr-1" /> Mark Paid (Cash)
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Paid bills */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Payment History ({paid.length})
          </h2>
          <Card className="p-4">
            {paid.length > 0 ? (
              <div className="space-y-2">
                {paid.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{patientName(bill.patientId)}</p>
                        <p className="text-xs text-muted-foreground">
                          {bill.serviceType} · {new Date(bill.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">₴{bill.amount.toFixed(2)}</p>
                      <span className="text-xs text-muted-foreground">
                        {bill.paymentMethod === 'ONLINE' ? '💳 Online' : '💵 Cash'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">No paid bills yet</p>
            )}
          </Card>
        </div>

        {bills.length === 0 && (
          <Card className="p-12 text-center mt-4">
            <p className="text-muted-foreground">No billing records yet</p>
          </Card>
        )}
      </div>
    </Sidebar>
  );
}
