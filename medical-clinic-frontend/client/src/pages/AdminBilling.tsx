import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { billingService, patientService } from '@/services/api';
import { toast } from 'sonner';
import type { Payment, User } from '@/types';
import { Loader2, CheckCircle, CreditCard, Trash2, Banknote } from 'lucide-react';

export default function AdminBilling() {
  const [bills, setBills] = useState<Payment[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [billsRes, patientsRes, doctorsRes] = await Promise.all([
        billingService.getAllBills(),
        patientService.getAllPatients(),
        patientService.getAllDoctors(),
      ]);
      setBills(billsRes.data);
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
    } catch {
      toast.error('Failed to load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  const getName = (list: User[], id: number) => {
    const u = list.find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : `#${id}`;
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

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this bill?')) return;
    try {
      await billingService.deleteBill(id);
      toast.success('Bill deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete bill');
    }
  };

  const totalRevenue = bills.filter(b => b.status === 'PAID').reduce((s, b) => s + b.amount, 0);
  const pendingCount = bills.filter(b => b.status === 'PENDING').length;

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing</h1>
          <p className="text-muted-foreground">Manage all patient bills</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Bills</p>
            <p className="text-2xl font-bold text-foreground">{bills.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Revenue Collected</p>
            <p className="text-2xl font-bold text-green-600">₴{totalRevenue.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Pending Bills</p>
            <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium text-foreground">Patient</th>
                  <th className="text-left py-3 px-3 font-medium text-foreground">Doctor</th>
                  <th className="text-left py-3 px-3 font-medium text-foreground">Service</th>
                  <th className="text-left py-3 px-3 font-medium text-foreground">Amount</th>
                  <th className="text-left py-3 px-3 font-medium text-foreground">Date</th>
                  <th className="text-left py-3 px-3 font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-3 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id} className="border-b border-border hover:bg-secondary">
                    <td className="py-3 px-3 text-sm text-foreground">{getName(patients, bill.patientId)}</td>
                    <td className="py-3 px-3 text-sm text-foreground">Dr. {getName(doctors, bill.doctorId)}</td>
                    <td className="py-3 px-3 text-sm text-muted-foreground">{bill.serviceType}</td>
                    <td className="py-3 px-3 font-semibold text-foreground">₴{bill.amount.toFixed(2)}</td>
                    <td className="py-3 px-3 text-sm text-muted-foreground">
                      {new Date(bill.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      {bill.status === 'PAID' ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle size={14} className="text-green-500" />
                          <span className="text-xs text-green-700 font-medium">
                            PAID · {bill.paymentMethod === 'ONLINE' ? '💳' : '💵'}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        {bill.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkPaid(bill.id)}
                            className="text-green-600 border-green-300 hover:bg-green-50 text-xs"
                          >
                            <Banknote size={12} className="mr-1" /> Cash
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(bill.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bills.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No bills found</p>
          )}
        </Card>
      </div>
    </Sidebar>
  );
}
