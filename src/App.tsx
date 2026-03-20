import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { AppLayout } from "@/components/AppLayout";
import Auth from "./pages/Auth";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Clients from "./pages/Clients";
import Professionals from "./pages/Professionals";
import Services from "./pages/Services";
import Financial from "./pages/Financial";
import MyFinancial from "./pages/MyFinancial";
import WhatsApp from "./pages/WhatsApp";
import BookingConfig from "./pages/BookingConfig";
import SalonSettings from "./pages/SalonSettings";
import PublicBooking from "./pages/PublicBooking";
import AppointmentConfirmation from "./pages/AppointmentConfirmation";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/meu-financeiro" element={<MyFinancial />} />
              <Route path="/clientes" element={<AdminRoute><Clients /></AdminRoute>} />
              <Route path="/profissionais" element={<AdminRoute><Professionals /></AdminRoute>} />
              <Route path="/servicos" element={<AdminRoute><Services /></AdminRoute>} />
              <Route path="/financeiro" element={<AdminRoute><Financial /></AdminRoute>} />
              <Route path="/whatsapp" element={<AdminRoute><WhatsApp /></AdminRoute>} />
              <Route path="/agendamento-config" element={<AdminRoute><BookingConfig /></AdminRoute>} />
              <Route path="/configuracoes" element={<AdminRoute><SalonSettings /></AdminRoute>} />
            </Route>
            <Route path="/salao/:slug" element={<PublicBooking />} />
            <Route path="/confirmar/:token" element={<AppointmentConfirmation action="confirm" />} />
            <Route path="/cancelar/:token" element={<AppointmentConfirmation action="cancel" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
