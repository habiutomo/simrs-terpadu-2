import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layout/main-layout";

// Pages
import Dashboard from "@/pages/dashboard";
import PatientsIndex from "@/pages/patients/index";
import PatientRegister from "@/pages/patients/register";
import AppointmentsIndex from "@/pages/appointments/index";
import AppointmentCreate from "@/pages/appointments/create";
import MedicalRecordsIndex from "@/pages/medical-records/index";
import MedicalRecordCreate from "@/pages/medical-records/create";
import PharmacyIndex from "@/pages/pharmacy/index";
import PharmacyCreateOrder from "@/pages/pharmacy/create-order";
import BillingIndex from "@/pages/billing/index";
import BillingCreateInvoice from "@/pages/billing/create-invoice";
import ReportsIndex from "@/pages/reports/index";
import SatuSehatIndex from "@/pages/satu-sehat/index";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/patients" component={PatientsIndex} />
      <Route path="/patients/register" component={PatientRegister} />
      <Route path="/appointments" component={AppointmentsIndex} />
      <Route path="/appointments/create" component={AppointmentCreate} />
      <Route path="/medical-records" component={MedicalRecordsIndex} />
      <Route path="/medical-records/create" component={MedicalRecordCreate} />
      <Route path="/pharmacy" component={PharmacyIndex} />
      <Route path="/pharmacy/create-order" component={PharmacyCreateOrder} />
      <Route path="/billing" component={BillingIndex} />
      <Route path="/billing/create-invoice" component={BillingCreateInvoice} />
      <Route path="/reports" component={ReportsIndex} />
      <Route path="/satu-sehat" component={SatuSehatIndex} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Router />
      </MainLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
