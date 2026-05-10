import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PatientDoctors from "./pages/PatientDoctors";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import AdminDoctors from "./pages/AdminDoctors";
import AdminPatients from "./pages/AdminPatients";
import AdminAppointments from "./pages/AdminAppointments";
import DoctorPatients from "./pages/DoctorPatients";
import DoctorTreatments from "./pages/DoctorTreatments";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorPatientHistory from "./pages/DoctorPatientHistory";
import PatientHistory from "./pages/PatientHistory";
import PatientProfile from "./pages/PatientProfile";
import AdminBilling from "./pages/AdminBilling";
import DoctorBilling from "./pages/DoctorBilling";

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return <Redirect to={isAuthenticated ? "/dashboard" : "/login"} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/404" component={NotFound} />

      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>

      {/* Admin */}
      <Route path="/admin/doctors">
        <ProtectedRoute requiredRoles={['ADMIN']}><AdminDoctors /></ProtectedRoute>
      </Route>
      <Route path="/admin/patients">
        <ProtectedRoute requiredRoles={['ADMIN']}><AdminPatients /></ProtectedRoute>
      </Route>
      <Route path="/admin/appointments">
        <ProtectedRoute requiredRoles={['ADMIN']}><AdminAppointments /></ProtectedRoute>
      </Route>
      <Route path="/admin/billing">
        <ProtectedRoute requiredRoles={['ADMIN']}><AdminBilling /></ProtectedRoute>
      </Route>

      {/* Doctor */}
      <Route path="/doctor/appointments">
        <ProtectedRoute requiredRoles={['DOCTOR']}><Appointments /></ProtectedRoute>
      </Route>
      <Route path="/doctor/patients/:patientId/history">
        <ProtectedRoute requiredRoles={['DOCTOR']}><DoctorPatientHistory /></ProtectedRoute>
      </Route>
      <Route path="/doctor/patients">
        <ProtectedRoute requiredRoles={['DOCTOR']}><DoctorPatients /></ProtectedRoute>
      </Route>
      <Route path="/doctor/treatments">
        <ProtectedRoute requiredRoles={['DOCTOR']}><DoctorTreatments /></ProtectedRoute>
      </Route>
      <Route path="/doctor/billing">
        <ProtectedRoute requiredRoles={['DOCTOR']}><DoctorBilling /></ProtectedRoute>
      </Route>
      <Route path="/doctor/profile">
        <ProtectedRoute requiredRoles={['DOCTOR']}><DoctorProfile /></ProtectedRoute>
      </Route>

      {/* Patient */}
      <Route path="/patient/doctors">
        <ProtectedRoute requiredRoles={['PATIENT']}><PatientDoctors /></ProtectedRoute>
      </Route>
      <Route path="/patient/appointments">
        <ProtectedRoute requiredRoles={['PATIENT']}><Appointments /></ProtectedRoute>
      </Route>
      <Route path="/patient/history">
        <ProtectedRoute requiredRoles={['PATIENT']}><PatientHistory /></ProtectedRoute>
      </Route>
      <Route path="/patient/billing">
        <ProtectedRoute requiredRoles={['PATIENT']}><Billing /></ProtectedRoute>
      </Route>
      <Route path="/patient/profile">
        <ProtectedRoute requiredRoles={['PATIENT']}><PatientProfile /></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
