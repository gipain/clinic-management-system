import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layouts/Sidebar';
import { Card } from '@/components/ui/card';
import { Users, Calendar, FileText, CreditCard } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Appointments', value: '24', icon: Calendar, color: 'bg-blue-100' },
    { label: 'Patients', value: '156', icon: Users, color: 'bg-green-100' },
    { label: 'Medical Records', value: '89', icon: FileText, color: 'bg-purple-100' },
    { label: 'Pending Payments', value: '$2,450', icon: CreditCard, color: 'bg-orange-100' },
  ];

  return (
    <Sidebar>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'ADMIN' && 'Manage your clinic efficiently'}
            {user?.role === 'DOCTOR' && 'Manage your appointments and patients'}
            {user?.role === 'PATIENT' && 'Track your health and appointments'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon size={24} className="text-primary" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center p-3 bg-secondary rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Appointment scheduled with Dr. Smith
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Sidebar>
  );
}
