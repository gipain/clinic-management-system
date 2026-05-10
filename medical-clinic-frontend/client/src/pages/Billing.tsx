import { useEffect, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { billingService } from '@/services/api';
import { toast } from 'sonner';
import type { Payment } from '@/types';
import { Loader2, CreditCard, CheckCircle, Banknote } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function formatCard(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export default function Billing() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Payment | null>(null);
  const [isPayingOnline, setIsPayingOnline] = useState(false);
  const [card, setCard] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [cardError, setCardError] = useState('');

  useEffect(() => { fetchBills(); }, []);

  const fetchBills = async () => {
    try {
      if (user?.id) {
        const res = await billingService.getPatientBills(user.id);
        setPayments(res.data);
      }
    } catch {
      toast.error('Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayOnline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;
    setCardError('');
    try {
      await billingService.payOnline(selectedBill.id, {
        cardNumber: card.cardNumber.replace(/\s/g, ''),
        expiry: card.expiry,
        cvv: card.cvv,
      });
      toast.success('Payment successful!');
      setSelectedBill(null);
      setCard({ cardNumber: '', expiry: '', cvv: '' });
      fetchBills();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Payment failed';
      setCardError(msg);
    }
  };

  const totalAmount   = payments.reduce((s, p) => s + p.amount, 0);
  const paidAmount    = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing & Payments</h1>
          <p className="text-muted-foreground">Your medical bills and payment history</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold text-foreground">₴{totalAmount.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-600">₴{paidAmount.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-orange-600">₴{pendingAmount.toFixed(2)}</p>
          </Card>
        </div>

        {/* Bills list */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Bills</h2>
          <div className="space-y-3">
            {payments.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bill.status === 'PAID' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {bill.status === 'PAID'
                      ? <CheckCircle size={20} className="text-green-600" />
                      : <CreditCard size={20} className="text-orange-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{bill.serviceType}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(bill.paymentDate).toLocaleDateString()}
                      {bill.paymentMethod && <span className="ml-2 text-xs">· {bill.paymentMethod === 'ONLINE' ? 'Online' : 'Cash'}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">₴{bill.amount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      bill.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {bill.status}
                    </span>
                  </div>

                  {bill.status === 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => { setSelectedBill(bill); setCardError(''); setCard({ cardNumber: '', expiry: '', cvv: '' }); }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <CreditCard size={14} className="mr-1" /> Pay Online
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {payments.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No bills found</p>
          )}
        </Card>

        {/* Online payment dialog */}
        <Dialog open={!!selectedBill} onOpenChange={(open) => { if (!open) setSelectedBill(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard size={20} /> Online Payment
              </DialogTitle>
            </DialogHeader>

            {selectedBill && (
              <>
                <div className="bg-secondary rounded-lg p-4 mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">{selectedBill.serviceType}</p>
                      <p className="text-sm text-muted-foreground">Bill #{selectedBill.id}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">₴{selectedBill.amount.toFixed(2)}</p>
                  </div>
                </div>

                <form onSubmit={handlePayOnline} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <Input
                      value={card.cardNumber}
                      onChange={(e) => setCard({ ...card, cardNumber: formatCard(e.target.value) })}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry (MM/YY)</label>
                      <Input
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <Input
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                        placeholder="123"
                        maxLength={3}
                        type="password"
                        required
                      />
                    </div>
                  </div>

                  {cardError && (
                    <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{cardError}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    Your card data is used only for this transaction and is not stored.
                  </div>

                  <Button
                    type="submit"
                    disabled={isPayingOnline}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    {isPayingOnline ? <Loader2 size={16} className="animate-spin mr-2" /> : <CreditCard size={16} className="mr-2" />}
                    Pay ₴{selectedBill.amount.toFixed(2)}
                  </Button>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
}
