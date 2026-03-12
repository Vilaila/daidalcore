import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ShoppingCart, Package, AlertTriangle, Clock } from "lucide-react";
import { presupuestos, eventosEconomicos, pedidos, inventario, getSecciones } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useRole } from "@/contexts/RoleContext";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { isAdmin } = useRole();

  const dineroDisponible = eventosEconomicos.reduce((s, e) => s + e.presupuestoDisponible, 0);
  const dineroEventos = eventosEconomicos.filter(e => e.estado === "En progreso").reduce((s, e) => s + e.presupuestoDisponible, 0);
  const totalPedidos = pedidos.length;
  const pedidosEstancados = pedidos.filter(p => p.estadoPedido === "Proforma");
  const presupuestosAlta = presupuestos.filter(p => p.prioridad === "Alta" && p.estado === "Pendiente");

  // Data by section
  const secciones = getSecciones();
  const datosSecciones = secciones.map(sec => ({
    name: sec,
    total: presupuestos.filter(p => p.seccion === sec).reduce((s, p) => s + p.unidades * p.precioUnitario, 0),
    count: presupuestos.filter(p => p.seccion === sec).length,
  }));

  const estadoPedidos = [
    { name: "Pendiente", value: pedidos.filter(p => p.estadoPedido === "Pendiente de correo").length },
    { name: "Proforma", value: pedidos.filter(p => p.estadoPedido === "Proforma").length },
    { name: "En curso", value: pedidos.filter(p => p.estadoPedido === "Solicitud empezada").length },
    { name: "Factura", value: pedidos.filter(p => p.estadoPedido === "Factura").length },
    { name: "Terminado", value: pedidos.filter(p => p.estadoPedido === "Terminado").length },
  ].filter(d => d.value > 0);

  const COLORS = [
    "hsl(0, 75%, 85%)",
    "hsl(45, 100%, 80%)",
    "hsl(35, 95%, 55%)",
    "hsl(145, 55%, 75%)",
    "hsl(145, 45%, 55%)",
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Resumen general de Daidalonic UPV</p>
      </div>

      {/* Alerts */}
      {(presupuestosAlta.length > 0 || pedidosEstancados.length > 0) && (
        <motion.div variants={item} className="space-y-2">
          {presupuestosAlta.map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-pastel-red rounded-lg px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
              <span><strong>Prioridad Alta:</strong> "{p.nombre}" está pendiente de aprobación</span>
            </div>
          ))}
          {pedidosEstancados.map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-pastel-yellow rounded-lg px-4 py-3 text-sm">
              <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(35, 95%, 45%)" }} />
              <span><strong>Pedido estancado:</strong> Pedido a "{p.empresa}" lleva en Proforma</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pastel-green flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Dinero Disponible</p>
              <p className="text-xl font-bold text-foreground">{dineroDisponible.toLocaleString("es-ES")} €</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pastel-yellow flex items-center justify-center">
              <TrendingUp className="w-5 h-5" style={{ color: "hsl(35, 80%, 40%)" }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Dinero por Eventos</p>
              <p className="text-xl font-bold text-foreground">{dineroEventos.toLocaleString("es-ES")} €</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pastel-orange flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" style={{ color: "hsl(25, 90%, 40%)" }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pedidos Activos</p>
              <p className="text-xl font-bold text-foreground">{totalPedidos}</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pastel-red flex items-center justify-center">
              <Package className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Inventario</p>
              <p className="text-xl font-bold text-foreground">{inventario.reduce((s, i) => s + i.unidades, 0)} uds</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="kpi-card">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Gasto por Sección</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={datosSecciones}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => `${v.toFixed(2)} €`} />
              <Bar dataKey="total" fill="hsl(35, 95%, 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="kpi-card">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Estado de Pedidos</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={estadoPedidos} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {estadoPedidos.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {isAdmin() && (
        <motion.div variants={item} className="kpi-card border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--gradient-brand)" }} />
            <h3 className="text-sm font-semibold text-foreground">Panel de Administración</h3>
          </div>
          <p className="text-sm text-muted-foreground">Acceso completo a configuración, gestión de roles y administración del sistema.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
