import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock, Package,
  ShoppingCart, Activity, ArrowRight, AlertCircle, BarChart3, Zap,
  FileText, Users, Box, CalendarDays, ChevronRight, Wallet, PieChart,
  CircleDollarSign, TriangleAlert, PackageOpen
} from "lucide-react";
import { presupuestos, eventosEconomicos, pedidos, inventario } from "@/data/mockData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar, Legend,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

// Brand colors
const TEAL = "#70D7C1";
const YELLOW = "#F9B825";
const PINK = "#F6416C";
const TEAL_SOFT = "hsl(166, 55%, 92%)";
const YELLOW_SOFT = "hsl(45, 95%, 92%)";
const PINK_SOFT = "hsl(345, 90%, 92%)";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

// ─── Computed data ───────────────────────────────────────────────────

const dineroDisponible = eventosEconomicos.reduce((s, e) => s + e.presupuestoDisponible, 0);
const dineroGastado = presupuestos
  .filter(p => p.estado === "Aprobado")
  .reduce((s, p) => s + p.unidades * p.precioUnitario, 0);
const ejecucion = dineroDisponible > 0 ? Math.round((dineroGastado / dineroDisponible) * 100) : 0;
const pedidosRetrasados = pedidos.filter(p => p.estadoPedido === "Proforma" || p.estadoPedido === "Pendiente de correo");
const eventosAgotandose = eventosEconomicos.filter(e => {
  const gastado = presupuestos
    .filter(p => p.eventoEconomico === e.id && p.estado === "Aprobado")
    .reduce((s, p) => s + p.unidades * p.precioUnitario, 0);
  return gastado / e.presupuestoDisponible > 0.8;
});
const inventarioCritico = inventario.filter(i => i.unidades <= 2 || i.estado === "Averiado" || i.estado === "Roto");

// ─── Alerts ──────────────────────────────────────────────────────────

interface Alert {
  icon: typeof AlertTriangle;
  text: string;
  priority: "Alta" | "Media";
  detailType: KpiDetailType;
}

const alerts: Alert[] = [];
pedidos.filter(p => p.estadoPedido === "Proforma").forEach(p => {
  alerts.push({ icon: Clock, text: `Pedido a "${p.empresa}" lleva días en Proforma`, priority: "Alta", detailType: "pedidos-retrasados" });
});
eventosAgotandose.forEach(e => {
  alerts.push({ icon: AlertCircle, text: `Evento "${e.nombre}" al >80% de gasto`, priority: "Alta", detailType: "eventos-agotandose" });
});
inventarioCritico.slice(0, 2).forEach(i => {
  alerts.push({ icon: Package, text: `"${i.nombre}" — ${i.unidades} uds (${i.estado})`, priority: "Media", detailType: "inventario-critico" });
});

// ─── Monthly spending data ───────────────────────────────────────────

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const gastoMensual = meses.map((mes, i) => {
  const gasto = presupuestos
    .filter(p => new Date(p.fecha).getMonth() === i && p.estado === "Aprobado")
    .reduce((s, p) => s + p.unidades * p.precioUnitario, 0);
  return { mes, gasto };
});
let acum = 0;
const gastoAcumulado = gastoMensual.map(d => {
  acum += d.gasto;
  return { ...d, acumulado: acum };
});

// ─── Spending by section (bar chart) ─────────────────────────────────

const seccionesAll = ["Electrónica", "Mecánica", "Fabricación"];
const gastoSeccion = seccionesAll.map(sec => ({
  seccion: sec,
  gasto: presupuestos.filter(p => p.seccion === sec && p.estado === "Aprobado")
    .reduce((s, p) => s + p.unidades * p.precioUnitario, 0),
  pendiente: presupuestos.filter(p => p.seccion === sec && p.estado === "Pendiente")
    .reduce((s, p) => s + p.unidades * p.precioUnitario, 0),
}));

// ─── Budget donut ────────────────────────────────────────────────────

const donutData = [
  { name: "Gastado", value: dineroGastado, color: PINK },
  { name: "Disponible", value: dineroDisponible - dineroGastado, color: TEAL },
];

// ─── Priority distribution (pie) ─────────────────────────────────────

const prioridadData = [
  { name: "Alta", value: presupuestos.filter(p => p.prioridad === "Alta").length, color: PINK },
  { name: "Media", value: presupuestos.filter(p => p.prioridad === "Media").length, color: YELLOW },
  { name: "Baja", value: presupuestos.filter(p => p.prioridad === "Baja").length, color: TEAL },
];

// ─── Heatmap data ────────────────────────────────────────────────────

const heatmapData = seccionesAll.map(sec => {
  const presus = presupuestos.filter(p => p.seccion === sec);
  const gastoTotal = presus.reduce((s, p) => s + p.unidades * p.precioUnitario, 0);
  const pedidosActivos = pedidos.filter(p =>
    p.presupuestosIds.some(pid => presus.find(pr => pr.id === pid))
  ).filter(p => p.estadoPedido !== "Terminado").length;
  const retrasos = pedidos.filter(p =>
    p.presupuestosIds.some(pid => presus.find(pr => pr.id === pid))
  ).filter(p => p.estadoPedido === "Proforma" || p.estadoPedido === "Pendiente de correo").length;
  const prioridadAlta = presus.filter(p => p.prioridad === "Alta").length;
  return { seccion: sec, gastoTotal, pedidosActivos, retrasos, prioridadAlta };
});

// ─── Order funnel ────────────────────────────────────────────────────

const funnelSteps = [
  { name: "Pendiente de correo", key: "Pendiente de correo" as const },
  { name: "Proforma", key: "Proforma" as const },
  { name: "Solicitud empezada", key: "Solicitud empezada" as const },
  { name: "Factura", key: "Factura" as const },
  { name: "Terminado", key: "Terminado" as const },
];
const funnelData = funnelSteps.map(step => ({
  ...step,
  count: pedidos.filter(p => p.estadoPedido === step.key).length,
}));

// ─── Risks ───────────────────────────────────────────────────────────

const risks = [
  { icon: TrendingDown, title: "Ritmo de gasto elevado", desc: `Si continúa el ritmo actual, el presupuesto se agotará antes de diciembre. Ejecución al ${ejecucion}%.`, detailType: "dinero-gastado" as KpiDetailType },
  { icon: Clock, title: "Pedidos estancados", desc: `${pedidosRetrasados.length} pedidos llevan demasiado tiempo sin avanzar de estado.`, detailType: "pedidos-retrasados" as KpiDetailType },
  { icon: AlertCircle, title: "Eventos en riesgo", desc: `${eventosAgotandose.length} eventos económicos superan el 80% de ejecución presupuestaria.`, detailType: "eventos-agotandose" as KpiDetailType },
  { icon: Package, title: "Inventario crítico", desc: `${inventarioCritico.length} artículos tienen stock bajo o están averiados.`, detailType: "inventario-critico" as KpiDetailType },
];

// ─── Events cards ────────────────────────────────────────────────────

const eventCards = eventosEconomicos.map(e => {
  const gastado = presupuestos
    .filter(p => p.eventoEconomico === e.id && p.estado === "Aprobado")
    .reduce((s, p) => s + p.unidades * p.precioUnitario, 0);
  const pct = e.presupuestoDisponible > 0 ? Math.round((gastado / e.presupuestoDisponible) * 100) : 0;
  return { ...e, gastado, pct };
});

// ─── Recent activity ─────────────────────────────────────────────────

const recentActivity = [
  { icon: ShoppingCart, text: "Pedido a RoboComponents actualizado a Terminado", time: "Hace 2 horas", color: TEAL },
  { icon: FileText, text: "Factura de PrintMat SL registrada", time: "Hace 5 horas", color: YELLOW },
  { icon: Users, text: "Pedro Sánchez añadido como miembro activo", time: "Hace 1 día", color: TEAL },
  { icon: Box, text: "Servo MG996R registrado en inventario", time: "Hace 2 días", color: PINK },
  { icon: CalendarDays, text: "Evento 'Feria Maker 2025' creado", time: "Hace 3 días", color: YELLOW },
];

// ─── Helpers ─────────────────────────────────────────────────────────

function heatColor(value: number, max: number) {
  if (max === 0) return "bg-muted";
  const ratio = value / max;
  if (ratio > 0.7) return "bg-brand-pink-soft text-[hsl(345,70%,35%)]";
  if (ratio > 0.35) return "bg-brand-yellow-soft text-[hsl(35,80%,30%)]";
  return "bg-brand-teal-soft text-[hsl(166,40%,25%)]";
}

function funnelColor(step: string, count: number) {
  if (step === "Terminado") return TEAL;
  if (count > 0 && (step === "Proforma" || step === "Pendiente de correo")) return PINK;
  if (count > 0) return YELLOW;
  return "hsl(220,10%,80%)";
}

function estadoBadge(estado: string) {
  if (estado === "Terminado") return "bg-brand-teal-soft text-[hsl(166,40%,25%)]";
  if (estado === "En progreso") return "bg-brand-yellow-soft text-[hsl(35,80%,30%)]";
  return "bg-muted text-muted-foreground";
}

// ─── Detail types ────────────────────────────────────────────────────

type KpiDetailType =
  | "dinero-disponible"
  | "dinero-gastado"
  | "ejecucion"
  | "pedidos-retrasados"
  | "eventos-agotandose"
  | "inventario-critico"
  | null;

function DetailContent({ type }: { type: KpiDetailType }) {
  if (!type) return null;

  switch (type) {
    case "dinero-disponible":
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Desglose del presupuesto disponible por evento económico:</p>
          {eventosEconomicos.map(e => {
            const gastado = presupuestos
              .filter(p => p.eventoEconomico === e.id && p.estado === "Aprobado")
              .reduce((s, p) => s + p.unidades * p.precioUnitario, 0);
            const restante = e.presupuestoDisponible - gastado;
            return (
              <div key={e.id} className="p-3 rounded-lg border border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">{e.nombre}</span>
                  <span className={`status-badge text-[10px] ${estadoBadge(e.estado)}`}>{e.estado}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div><span className="block text-foreground font-semibold">{e.presupuestoDisponible.toLocaleString("es-ES")} €</span>Total</div>
                  <div><span className="block text-foreground font-semibold">{gastado.toLocaleString("es-ES")} €</span>Gastado</div>
                  <div><span className={`block font-semibold ${restante < 200 ? "text-accent" : "text-primary"}`}>{restante.toLocaleString("es-ES")} €</span>Restante</div>
                </div>
              </div>
            );
          })}
        </div>
      );

    case "dinero-gastado":
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Presupuestos aprobados que conforman el gasto:</p>
          {presupuestos.filter(p => p.estado === "Aprobado").map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">{p.nombre}</p>
                <p className="text-xs text-muted-foreground">{p.seccion} · {p.empresa}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{(p.unidades * p.precioUnitario).toLocaleString("es-ES")} €</p>
                <p className="text-[10px] text-muted-foreground">{p.unidades} × {p.precioUnitario} €</p>
              </div>
            </div>
          ))}
          <div className="flex justify-between p-3 rounded-lg bg-muted/50 font-semibold text-sm">
            <span>Total gastado</span>
            <span>{dineroGastado.toLocaleString("es-ES")} €</span>
          </div>
        </div>
      );

    case "ejecucion":
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Ejecución presupuestaria por evento:</p>
          {eventCards.map(e => (
            <div key={e.id} className="p-3 rounded-lg border border-border space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{e.nombre}</span>
                <span className="text-sm font-bold text-foreground">{e.pct}%</span>
              </div>
              <Progress value={e.pct} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Gastado: {e.gastado.toLocaleString("es-ES")} €</span>
                <span>Disponible: {e.presupuestoDisponible.toLocaleString("es-ES")} €</span>
              </div>
            </div>
          ))}
        </div>
      );

    case "pedidos-retrasados":
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Pedidos que llevan tiempo sin avanzar de estado:</p>
          {pedidosRetrasados.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No hay pedidos retrasados.</p>
          ) : (
            pedidosRetrasados.map(p => (
              <div key={p.id} className="p-3 rounded-lg border border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">{p.empresa}</span>
                  <Badge variant="outline" className="text-[10px]" style={{ borderColor: PINK, color: PINK }}>{p.estadoPedido}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div><span className="block text-foreground font-semibold">{p.precioTotal.toLocaleString("es-ES")} €</span>Precio total</div>
                  <div><span className="block text-foreground font-semibold">{p.tipoCompra}</span>Tipo de compra</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Estado envío:</span> {p.estadoEnvio}
                </div>
                {p.observaciones && <p className="text-xs text-muted-foreground italic">"{p.observaciones}"</p>}
              </div>
            ))
          )}
        </div>
      );

    case "eventos-agotandose":
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Eventos con más del 80% de presupuesto ejecutado:</p>
          {eventosAgotandose.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Ningún evento en riesgo.</p>
          ) : (
            eventosAgotandose.map(e => {
              const gastado = presupuestos
                .filter(p => p.eventoEconomico === e.id && p.estado === "Aprobado")
                .reduce((s, p) => s + p.unidades * p.precioUnitario, 0);
              const pct = Math.round((gastado / e.presupuestoDisponible) * 100);
              return (
                <div key={e.id} className="p-3 rounded-lg border border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{e.nombre}</span>
                    <span className="text-sm font-bold" style={{ color: pct > 90 ? PINK : YELLOW }}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-xs text-muted-foreground">{e.descripcion}</p>
                </div>
              );
            })
          )}
        </div>
      );

    case "inventario-critico":
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Artículos con stock bajo o en mal estado:</p>
          {inventarioCritico.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No hay artículos en estado crítico.</p>
          ) : (
            inventarioCritico.map(i => (
              <div key={i.id} className="p-3 rounded-lg border border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">{i.nombre}</span>
                  <Badge variant="outline" className="text-[10px]" style={{
                    borderColor: i.estado === "Roto" || i.estado === "Averiado" ? PINK : YELLOW,
                    color: i.estado === "Roto" || i.estado === "Averiado" ? PINK : YELLOW,
                  }}>{i.estado}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{i.descripcion}</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div><span className="block text-foreground font-semibold">{i.unidades} uds</span>Stock</div>
                  <div><span className="block text-foreground font-semibold">{i.ubicacion}</span>Ubicación</div>
                  <div><span className="block text-foreground font-semibold">{i.responsable}</span>Responsable</div>
                </div>
              </div>
            ))
          )}
        </div>
      );

    default:
      return null;
  }
}

const detailTitles: Record<string, string> = {
  "dinero-disponible": "Dinero disponible del año",
  "dinero-gastado": "Dinero gastado del año",
  "ejecucion": "% de ejecución del presupuesto",
  "pedidos-retrasados": "Pedidos retrasados",
  "eventos-agotandose": "Eventos a punto de agotarse",
  "inventario-critico": "Inventario crítico",
};

// ─── Component ───────────────────────────────────────────────────────

export default function DashboardPage() {
  const [detailOpen, setDetailOpen] = useState<KpiDetailType>(null);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10 max-w-[1400px] mx-auto">
      {/* Detail Dialog */}
      <Dialog open={detailOpen !== null} onOpenChange={(open) => !open && setDetailOpen(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailOpen ? detailTitles[detailOpen] : ""}</DialogTitle>
            <DialogDescription>Información detallada del indicador seleccionado</DialogDescription>
          </DialogHeader>
          <DetailContent type={detailOpen} />
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl p-8" style={{ background: "var(--gradient-hero)" }}>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">DaidalCore</h1>
          <p className="text-white/80 text-sm mt-1">Panel ejecutivo · Daidalonic UPV</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      </motion.div>

      {/* ═══════════════════ FRANJA SUPERIOR ═══════════════════ */}
      <section className="space-y-6">
        <SectionTitle label="Visión ejecutiva" />

        {/* KPIs row */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard icon={Wallet} title="Dinero disponible" value={`${dineroDisponible.toLocaleString("es-ES")} €`} subtitle="Presupuesto total" color="teal" onClick={() => setDetailOpen("dinero-disponible")} />
          <KpiCard icon={CircleDollarSign} title="Dinero gastado" value={`${dineroGastado.toLocaleString("es-ES")} €`} subtitle="Aprobado y comprometido" color={ejecucion > 70 ? "pink" : ejecucion > 40 ? "yellow" : "teal"} onClick={() => setDetailOpen("dinero-gastado")} />
          <KpiCard icon={PieChart} title="% Ejecución" value={`${ejecucion}%`} subtitle="Del presupuesto anual" color={ejecucion > 80 ? "pink" : ejecucion > 50 ? "yellow" : "teal"} onClick={() => setDetailOpen("ejecucion")} />
          <KpiCard icon={Clock} title="Pedidos retrasados" value={String(pedidosRetrasados.length)} subtitle="En Proforma o pendientes" color={pedidosRetrasados.length > 0 ? "pink" : "teal"} onClick={() => setDetailOpen("pedidos-retrasados")} />
          <KpiCard icon={TriangleAlert} title="Eventos agotándose" value={String(eventosAgotandose.length)} subtitle=">80% de ejecución" color={eventosAgotandose.length > 0 ? "yellow" : "teal"} onClick={() => setDetailOpen("eventos-agotandose")} />
          <KpiCard icon={PackageOpen} title="Inventario crítico" value={String(inventarioCritico.length)} subtitle="Stock bajo o averiado" color={inventarioCritico.length > 2 ? "pink" : inventarioCritico.length > 0 ? "yellow" : "teal"} onClick={() => setDetailOpen("inventario-critico")} />
        </motion.div>

        {/* Budget donut + Alerts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Budget donut */}
          <motion.div variants={item} className="kpi-card flex flex-col items-center">
            <h3 className="text-sm font-semibold text-foreground self-start mb-2">Distribución del presupuesto</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RePieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v.toLocaleString("es-ES")} €`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,15%,90%)", fontSize: 12 }} />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 text-xs text-muted-foreground -mt-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: TEAL }} />Disponible</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: PINK }} />Gastado</span>
            </div>
          </motion.div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <motion.div variants={item} className="kpi-card space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4" style={{ color: PINK }} />
                <h3 className="text-sm font-semibold text-foreground">Alertas críticas</h3>
              </div>
              {alerts.map((a, i) => (
                <button
                  key={i}
                  onClick={() => setDetailOpen(a.detailType)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm w-full text-left transition-all hover:scale-[1.01] cursor-pointer"
                  style={{
                    background: a.priority === "Alta" ? PINK_SOFT : YELLOW_SOFT,
                  }}
                >
                  <a.icon className="w-4 h-4 flex-shrink-0" style={{
                    color: a.priority === "Alta" ? PINK : YELLOW
                  }} />
                  <span className="flex-1 text-foreground">{a.text}</span>
                  <Badge variant="outline" className="text-[10px]" style={{
                    borderColor: a.priority === "Alta" ? PINK : YELLOW,
                    color: a.priority === "Alta" ? PINK : YELLOW,
                  }}>
                    {a.priority}
                  </Badge>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════ FRANJA MEDIA ═══════════════════ */}
      <section className="space-y-6">
        <SectionTitle label="Tendencias y comparativas" />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Monthly spending area chart */}
          <motion.div variants={item} className="kpi-card">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" style={{ color: TEAL }} />
              <h3 className="text-sm font-semibold text-foreground">Gasto acumulado mensual</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={gastoAcumulado}>
                <defs>
                  <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TEAL} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={TEAL} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,92%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(220,10%,75%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,10%,75%)" />
                <Tooltip formatter={(v: number) => [`${v.toFixed(2)} €`, "Acumulado"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,15%,90%)", fontSize: 12 }} />
                <Area type="monotone" dataKey="acumulado" stroke={TEAL} strokeWidth={2.5} fill="url(#gradArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Spending by section bar chart */}
          <motion.div variants={item} className="kpi-card">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" style={{ color: YELLOW }} />
              <h3 className="text-sm font-semibold text-foreground">Gasto por sección</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={gastoSeccion} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,92%)" />
                <XAxis dataKey="seccion" tick={{ fontSize: 11 }} stroke="hsl(220,10%,75%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,10%,75%)" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,15%,90%)", fontSize: 12 }} formatter={(v: number) => [`${v.toFixed(2)} €`, ""]} />
                <Bar dataKey="gasto" name="Aprobado" fill={TEAL} radius={[6, 6, 0, 0]} />
                <Bar dataKey="pendiente" name="Pendiente" fill={YELLOW} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-5 text-xs text-muted-foreground mt-2 justify-center">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded" style={{ background: TEAL }} />Aprobado</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded" style={{ background: YELLOW }} />Pendiente</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Priority distribution pie */}
          <motion.div variants={item} className="kpi-card flex flex-col items-center">
            <h3 className="text-sm font-semibold text-foreground self-start mb-2">Prioridad de presupuestos</h3>
            <ResponsiveContainer width="100%" height={180}>
              <RePieChart>
                <Pie data={prioridadData} cx="50%" cy="50%" outerRadius={65} dataKey="value" strokeWidth={0} paddingAngle={3}>
                  {prioridadData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,15%,90%)", fontSize: 12 }} />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-xs text-muted-foreground -mt-1">
              {prioridadData.map(d => (
                <span key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </motion.div>

          {/* Heatmap */}
          <motion.div variants={item} className="kpi-card xl:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4" style={{ color: PINK }} />
              <h3 className="text-sm font-semibold text-foreground">Mapa de calor por sección</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-3 font-medium">Sección</th>
                    <th className="text-center py-2 px-2 font-medium">Gasto (€)</th>
                    <th className="text-center py-2 px-2 font-medium">Ped. activos</th>
                    <th className="text-center py-2 px-2 font-medium">Retrasos</th>
                    <th className="text-center py-2 px-2 font-medium">Prior. Alta</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map(row => {
                    const maxGasto = Math.max(...heatmapData.map(r => r.gastoTotal));
                    const maxPed = Math.max(...heatmapData.map(r => r.pedidosActivos), 1);
                    const maxRet = Math.max(...heatmapData.map(r => r.retrasos), 1);
                    const maxPrio = Math.max(...heatmapData.map(r => r.prioridadAlta), 1);
                    return (
                      <tr key={row.seccion}>
                        <td className="py-2 pr-3 font-medium text-foreground">{row.seccion}</td>
                        <td className="py-2 px-1"><div className={`text-center rounded-lg py-1.5 text-xs font-semibold ${heatColor(row.gastoTotal, maxGasto)}`}>{row.gastoTotal.toLocaleString("es-ES")}</div></td>
                        <td className="py-2 px-1"><div className={`text-center rounded-lg py-1.5 text-xs font-semibold ${heatColor(row.pedidosActivos, maxPed)}`}>{row.pedidosActivos}</div></td>
                        <td className="py-2 px-1"><div className={`text-center rounded-lg py-1.5 text-xs font-semibold ${heatColor(row.retrasos, maxRet)}`}>{row.retrasos}</div></td>
                        <td className="py-2 px-1"><div className={`text-center rounded-lg py-1.5 text-xs font-semibold ${heatColor(row.prioridadAlta, maxPrio)}`}>{row.prioridadAlta}</div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Order funnel */}
        <motion.div variants={item} className="kpi-card">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-4 h-4" style={{ color: YELLOW }} />
            <h3 className="text-sm font-semibold text-foreground">Flujo de estado de pedidos</h3>
          </div>
          <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
            {funnelData.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1 min-w-[110px]">
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full rounded-xl py-4 text-center text-white font-bold text-2xl shadow-sm" style={{ background: funnelColor(step.key, step.count) }}>
                    {step.count}
                  </div>
                  <span className="text-[11px] text-muted-foreground text-center leading-tight font-medium">{step.name}</span>
                </div>
                {i < funnelData.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground/30 flex-shrink-0 mx-1" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Workflow process */}
        <motion.div variants={item} className="kpi-card">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4" style={{ color: TEAL }} />
            <h3 className="text-sm font-semibold text-foreground">Flujo de trabajo: Presupuesto → Inventario</h3>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 overflow-x-auto pb-2">
            {[
              { step: "1", label: "Presupuesto", desc: "Coordinadores definen necesidades", color: TEAL },
              { step: "2", label: "Priorización", desc: "Se decide qué se compra primero", color: TEAL },
              { step: "3", label: "Tramitación", desc: "Se envían correos y proformas", color: YELLOW },
              { step: "4", label: "Recepción", desc: "Llega el pedido al laboratorio", color: YELLOW },
              { step: "5", label: "Inventario", desc: "Se registra el material recibido", color: PINK },
            ].map((s, i) => (
              <div key={i} className="flex items-center flex-1 min-w-[140px]">
                <div className="flex flex-col items-center flex-1 gap-1.5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md" style={{ background: s.color }}>
                    {s.step}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{s.label}</span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[120px]">{s.desc}</span>
                </div>
                {i < 4 && <ArrowRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 mx-1 hidden md:block" />}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════ FRANJA INFERIOR ═══════════════════ */}
      <section className="space-y-6">
        <SectionTitle label="Detalle y contexto" />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Risks */}
          <motion.div variants={item} className="kpi-card space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" style={{ color: PINK }} />
              <h3 className="text-sm font-semibold text-foreground">Riesgos detectados</h3>
            </div>
            {risks.map((r, i) => (
              <button
                key={i}
                onClick={() => setDetailOpen(r.detailType)}
                className="flex gap-3 p-3 rounded-xl bg-muted/40 w-full text-left transition-all hover:bg-muted hover:scale-[1.01] cursor-pointer"
              >
                <r.icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: PINK }} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              </button>
            ))}
          </motion.div>

          {/* Event cards */}
          <motion.div variants={item} className="kpi-card space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" style={{ color: YELLOW }} />
              <h3 className="text-sm font-semibold text-foreground">Eventos económicos</h3>
            </div>
            {eventCards.map(e => (
              <div key={e.id} className="p-3 rounded-xl border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{e.nombre}</span>
                  <span className={`status-badge text-[10px] ${estadoBadge(e.estado)}`}>{e.estado}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Disponible: {e.presupuestoDisponible.toLocaleString("es-ES")} €</span>
                  <span>Gastado: {e.gastado.toLocaleString("es-ES")} €</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Ejecución</span>
                    <span className="font-semibold">{e.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${e.pct}%`,
                      background: e.pct > 80 ? PINK : e.pct > 50 ? YELLOW : TEAL,
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Recent activity */}
          <motion.div variants={item} className="kpi-card space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: TEAL }} />
              <h3 className="text-sm font-semibold text-foreground">Actividad reciente</h3>
            </div>
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: a.color + "20" }}>
                  <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{a.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">{label}</h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function KpiCard({ icon: Icon, title, value, subtitle, color, onClick }: {
  icon: typeof Wallet;
  title: string;
  value: string;
  subtitle: string;
  color: "teal" | "yellow" | "pink";
  onClick?: () => void;
}) {
  const colorMap = {
    teal: { bg: TEAL_SOFT, accent: TEAL, text: "hsl(166, 40%, 22%)" },
    yellow: { bg: YELLOW_SOFT, accent: YELLOW, text: "hsl(35, 80%, 22%)" },
    pink: { bg: PINK_SOFT, accent: PINK, text: "hsl(345, 70%, 28%)" },
  };
  const c = colorMap[color];

  return (
    <button
      onClick={onClick}
      className="kpi-card !border-transparent transition-all hover:scale-[1.03] hover:shadow-md cursor-pointer text-left w-full group"
      style={{ background: c.bg }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.accent + "25" }}>
          <Icon className="w-4 h-4" style={{ color: c.accent }} />
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
      <p className="text-xl font-bold" style={{ color: c.text }}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>
    </button>
  );
}
