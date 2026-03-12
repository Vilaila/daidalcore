import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import PresupuestosPage from "./pages/PresupuestosPage";
import EventosPage from "./pages/EventosPage";
import PedidosPage from "./pages/PedidosPage";
import InventarioPage from "./pages/InventarioPage";
import EmpresasPage from "./pages/EmpresasPage";
import ColaboradoresPage from "./pages/ColaboradoresPage";
import MiembrosPage from "./pages/MiembrosPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
