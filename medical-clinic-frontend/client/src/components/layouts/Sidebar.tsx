import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const getNavItems = () => {
    const baseItems = [
      { label: 'Dashboard', path: '/dashboard' },
    ];

    if (user?.role === 'ADMIN') {
      return [
        ...baseItems,
        { label: 'Doctors', path: '/admin/doctors' },
        { label: 'Patients', path: '/admin/patients' },
        { label: 'Appointments', path: '/admin/appointments' },
        { label: 'Billing', path: '/admin/billing' },
      ];
    }

    if (user?.role === 'DOCTOR') {
      return [
        ...baseItems,
        { label: 'Appointments', path: '/doctor/appointments' },
        { label: 'Patients', path: '/doctor/patients' },
        { label: 'Treatments', path: '/doctor/treatments' },
        { label: 'Billing', path: '/doctor/billing' },
        { label: 'My Profile', path: '/doctor/profile' },
      ];
    }

    if (user?.role === 'PATIENT') {
      return [
        ...baseItems,
        { label: 'Doctors', path: '/patient/doctors' },
        { label: 'Appointments', path: '/patient/appointments' },
        { label: 'Medical History', path: '/patient/history' },
        { label: 'Billing', path: '/patient/billing' },
        { label: 'My Profile', path: '/patient/profile' },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static w-64 h-full bg-sidebar border-r border-sidebar-border transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } z-40 flex flex-col`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-primary">MediClinic</h1>
          <p className="text-sm text-muted-foreground mt-1">Management System</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                setLocation(item.path);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="px-4 py-2 bg-accent rounded-lg">
            <p className="text-sm font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground mt-1">{user?.role}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        {children}
      </main>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
