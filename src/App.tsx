import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/contexts/RoleContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import PresupuestosPage from "./pages/PresupuestosPage";
import EventosPage from "./pages/EventosPage";
import PedidosPage from "./pages/PedidosPage";
import InventarioPage from "./pages/InventarioPage";
import EmpresasPage from "./pages/EmpresasPage";
import ColaboradoresPage from "./pages/ColaboradoresPage";
import MiembrosPage from "./pages/MiembrosPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Session is active — render protected content

  return (
    <RoleProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/presupuestos" element={<PresupuestosPage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/config/empresas" element={<EmpresasPage />} />
          <Route path="/config/colaboradores" element={<ColaboradoresPage />} />
          <Route path="/config/miembros" element={<MiembrosPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </RoleProvider>
  );
}

function AuthRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthRoutes />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
