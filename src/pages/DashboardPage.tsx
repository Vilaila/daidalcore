import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock, Package,
  ShoppingCart, Activity, ArrowRight, AlertCircle, BarChart3, Zap,
  FileText, Users, Box, CalendarDays, X, ExternalLink, ChevronRight
} from "lucide-react";
import { presupuestos, eventosEconomicos, pedidos, inventario } from "@/data/mockData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

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
    .filter(p => {
      const m = new Date(p.fecha).getMonth();
      return m === i && p.estado === "Aprobado";
    })
    .reduce((s, p) => s + p.unidades * p.precioUnitario, 0);
  return { mes, gasto };
});
let acum = 0;
const gastoAcumulado = gastoMensual.map(d => {
  acum += d.gasto;
  return { ...d, acumulado: acum };
});

// ─── Heatmap data ────────────────────────────────────────────────────

const seccionesHeatmap = ["Electrónica", "Mecánica", "Fabricación"];
const heatmapData = seccionesHeatmap.map(sec => {
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
  { icon: ShoppingCart, text: "Pedido a RoboComponents actualizado a Terminado", time: "Hace 2 horas" },
  { icon: FileText, text: "Factura de PrintMat SL registrada", time: "Hace 5 horas" },
  { icon: Users, text: "Pedro Sánchez añadido como miembro activo", time: "Hace 1 día" },
  { icon: Box, text: "Servo MG996R registrado en inventario", time: "Hace 2 días" },
  { icon: CalendarDays, text: "Evento 'Feria Maker 2025' creado", time: "Hace 3 días" },
];

// ─── Helpers ─────────────────────────────────────────────────────────

function heatColor(value: number, max: number) {
  if (max === 0) return "bg-muted";
  const ratio = value / max;
  if (ratio > 0.7) return "bg-[hsl(0,70%,88%)] text-[hsl(0,60%,35%)]";
  if (ratio > 0.35) return "bg-[hsl(45,90%,88%)] text-[hsl(35,80%,30%)]";
  return "bg-[hsl(145,50%,88%)] text-[hsl(145,40%,25%)]";
}

function funnelColor(step: string, count: number) {
  if (step === "Terminado") return "bg-[hsl(145,50%,45%)]";
  if (count > 0 && (step === "Proforma" || step === "Pendiente de correo")) return "bg-[hsl(0,65%,58%)]";
  if (count > 0) return "bg-[hsl(35,90%,55%)]";
  return "bg-muted-foreground/30";
}

function estadoBadge(estado: string) {
  if (estado === "Terminado") return "bg-[hsl(145,50%,88%)] text-[hsl(145,40%,25%)]";
  if (estado === "En progreso") return "bg-[hsl(45,90%,88%)] text-[hsl(35,80%,30%)]";
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
                  <div><span className={`block font-semibold ${restante < 200 ? "text-[hsl(0,65%,50%)]" : "text-[hsl(145,40%,35%)]"}`}>{restante.toLocaleString("es-ES")} €</span>Restante</div>
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
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <div className="flex justify-between text-sm font-semibold">
              <span>Ejecución global</span>
              <span>{ejecucion}%</span>
            </div>
            <Progress value={ejecucion} className="h-2" />
          </div>
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
                  <Badge variant="outline" className="text-[10px] border-[hsl(0,60%,70%)] text-[hsl(0,60%,45%)]">{p.estadoPedido}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div><span className="block text-foreground font-semibold">{p.precioTotal.toLocaleString("es-ES")} €</span>Precio total</div>
                  <div><span className="block text-foreground font-semibold">{p.tipoCompra}</span>Tipo de compra</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Estado envío:</span> {p.estadoEnvio}
                </div>
                {p.observaciones && (
                  <p className="text-xs text-muted-foreground italic">"{p.observaciones}"</p>
                )}
                <p className="text-[10px] text-muted-foreground">Fecha: {p.fechaRealizacion}</p>
              </div>
            ))
          )}
        </div>
      );

    case "eventos-agotandose":
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Eventos económicos con más del 80% de presupuesto ejecutado:</p>
          {eventosAgotandose.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Ningún evento en riesgo de agotarse.</p>
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
                    <span className={`text-sm font-bold ${pct > 90 ? "text-[hsl(0,65%,50%)]" : "text-[hsl(35,80%,40%)]"}`}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-xs text-muted-foreground">{e.descripcion}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Gastado: {gastado.toLocaleString("es-ES")} €</span>
                    <span>Restante: {(e.presupuestoDisponible - gastado).toLocaleString("es-ES")} €</span>
                  </div>
                  {e.observaciones && (
                    <p className="text-xs text-muted-foreground italic mt-1">"{e.observaciones}"</p>
                  )}
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
                  <Badge variant="outline" className={`text-[10px] ${
                    i.estado === "Roto" || i.estado === "Averiado"
                      ? "border-[hsl(0,60%,70%)] text-[hsl(0,60%,45%)]"
                      : "border-[hsl(35,70%,65%)] text-[hsl(35,70%,35%)]"
                  }`}>{i.estado}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{i.descripcion}</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div><span className="block text-foreground font-semibold">{i.unidades} uds</span>Stock</div>
                  <div><span className="block text-foreground font-semibold">{i.ubicacion}</span>Ubicación</div>
                  <div><span className="block text-foreground font-semibold">{i.responsable}</span>Responsable</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Sección:</span> {i.seccion}
                </div>
                {i.observaciones && (
                  <p className="text-xs text-muted-foreground italic">"{i.observaciones}"</p>
                )}
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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-[1400px] mx-auto">
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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">DaidalCore</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Panel ejecutivo · Daidalonic UPV</p>
      </div>

      {/* ═══════════════════ FRANJA SUPERIOR ═══════════════════ */}
      <section className="space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Visión ejecutiva</h2>

        {/* KPIs */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard title="Dinero disponible" value={`${dineroDisponible.toLocaleString("es-ES")} €`} subtitle="Presupuesto total del año" color="green" onClick={() => setDetailOpen("dinero-disponible")} />
          <KpiCard title="Dinero gastado" value={`${dineroGastado.toLocaleString("es-ES")} €`} subtitle="Aprobado y comprometido" color={ejecucion > 70 ? "red" : ejecucion > 40 ? "yellow" : "green"} onClick={() => setDetailOpen("dinero-gastado")} />
          <KpiCard title="% Ejecución" value={`${ejecucion}%`} subtitle="Del presupuesto anual" color={ejecucion > 80 ? "red" : ejecucion > 50 ? "yellow" : "green"} onClick={() => setDetailOpen("ejecucion")} />
          <KpiCard title="Pedidos retrasados" value={String(pedidosRetrasados.length)} subtitle="En Proforma o pendientes" color={pedidosRetrasados.length > 0 ? "red" : "green"} onClick={() => setDetailOpen("pedidos-retrasados")} />
          <KpiCard title="Eventos agotándose" value={String(eventosAgotandose.length)} subtitle=">80% de ejecución" color={eventosAgotandose.length > 0 ? "yellow" : "green"} onClick={() => setDetailOpen("eventos-agotandose")} />
          <KpiCard title="Inventario crítico" value={String(inventarioCritico.length)} subtitle="Stock bajo o averiado" color={inventarioCritico.length > 2 ? "red" : inventarioCritico.length > 0 ? "yellow" : "green"} onClick={() => setDetailOpen("inventario-critico")} />
        </motion.div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <motion.div variants={item} className="kpi-card !p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold text-foreground">Alertas críticas</h3>
            </div>
            {alerts.map((a, i) => (
              <button
                key={i}
                onClick={() => setDetailOpen(a.detailType)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm w-full text-left transition-all hover:scale-[1.01] hover:shadow-sm cursor-pointer ${
                  a.priority === "Alta"
                    ? "bg-[hsl(0,75%,95%)] hover:bg-[hsl(0,75%,92%)]"
                    : "bg-[hsl(45,100%,94%)] hover:bg-[hsl(45,100%,91%)]"
                }`}
              >
                <a.icon className="w-4 h-4 flex-shrink-0" style={{
                  color: a.priority === "Alta" ? "hsl(0, 65%, 50%)" : "hsl(35, 80%, 45%)"
                }} />
                <span className="flex-1">{a.text}</span>
                <Badge variant="outline" className={`text-[10px] ${
                  a.priority === "Alta"
                    ? "border-[hsl(0,60%,70%)] text-[hsl(0,60%,45%)]"
                    : "border-[hsl(35,70%,65%)] text-[hsl(35,70%,35%)]"
                }`}>
                  {a.priority}
                </Badge>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </motion.div>
        )}
      </section>

      {/* ═══════════════════ FRANJA MEDIA ═══════════════════ */}
      <section className="space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tendencias y comparativas</h2>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Monthly spending chart */}
          <motion.div variants={item} className="kpi-card">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Gasto acumulado mensual</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={gastoAcumulado}>
                <defs>
                  <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(35, 95%, 55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(35, 95%, 55%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,92%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(220,10%,70%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,10%,70%)" />
                <Tooltip
                  formatter={(v: number) => [`${v.toFixed(2)} €`, "Acumulado"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,15%,90%)", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="acumulado" stroke="hsl(35, 95%, 55%)" strokeWidth={2.5} fill="url(#gradArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Heatmap */}
          <motion.div variants={item} className="kpi-card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-muted-foreground" />
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
                        <td className="py-1.5 pr-3 font-medium text-foreground">{row.seccion}</td>
                        <td className="py-1.5 px-1"><div className={`text-center rounded-md py-1 text-xs font-semibold ${heatColor(row.gastoTotal, maxGasto)}`}>{row.gastoTotal.toLocaleString("es-ES")}</div></td>
                        <td className="py-1.5 px-1"><div className={`text-center rounded-md py-1 text-xs font-semibold ${heatColor(row.pedidosActivos, maxPed)}`}>{row.pedidosActivos}</div></td>
                        <td className="py-1.5 px-1"><div className={`text-center rounded-md py-1 text-xs font-semibold ${heatColor(row.retrasos, maxRet)}`}>{row.retrasos}</div></td>
                        <td className="py-1.5 px-1"><div className={`text-center rounded-md py-1 text-xs font-semibold ${heatColor(row.prioridadAlta, maxPrio)}`}>{row.prioridadAlta}</div></td>
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
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Flujo de estado de pedidos</h3>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {funnelData.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1 min-w-[100px]">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-full rounded-lg py-3 text-center ${funnelColor(step.key, step.count)} text-white font-bold text-lg`}>
                    {step.count}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1.5 text-center leading-tight">{step.name}</span>
                </div>
                {i < funnelData.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mx-1" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════ FRANJA INFERIOR ═══════════════════ */}
      <section className="space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Detalle y contexto</h2>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Risks */}
          <motion.div variants={item} className="kpi-card space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold text-foreground">Riesgos detectados</h3>
            </div>
            {risks.map((r, i) => (
              <button
                key={i}
                onClick={() => setDetailOpen(r.detailType)}
                className="flex gap-3 p-3 rounded-lg bg-muted/50 w-full text-left transition-all hover:bg-muted hover:scale-[1.01] cursor-pointer"
              >
                <r.icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
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
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Eventos económicos</h3>
            </div>
            {eventCards.map(e => (
              <div key={e.id} className="p-3 rounded-lg border border-border space-y-2">
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
                    <span>{e.pct}%</span>
                  </div>
                  <Progress value={e.pct} className="h-1.5" />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Recent activity */}
          <motion.div variants={item} className="kpi-card space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Actividad reciente</h3>
            </div>
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <a.icon className="w-3.5 h-3.5 text-muted-foreground" />
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

// ─── KPI Card ────────────────────────────────────────────────────────

function KpiCard({ title, value, subtitle, color, onClick }: {
  title: string; value: string; subtitle: string; color: "green" | "yellow" | "red"; onClick?: () => void;
}) {
  const colorMap = {
    green: { bg: "bg-[hsl(145,50%,92%)]", accent: "bg-[hsl(145,50%,45%)]", text: "text-[hsl(145,40%,25%)]", hover: "hover:bg-[hsl(145,50%,89%)]" },
    yellow: { bg: "bg-[hsl(45,90%,92%)]", accent: "bg-[hsl(35,90%,50%)]", text: "text-[hsl(35,80%,25%)]", hover: "hover:bg-[hsl(45,90%,89%)]" },
    red: { bg: "bg-[hsl(0,70%,94%)]", accent: "bg-[hsl(0,65%,55%)]", text: "text-[hsl(0,55%,30%)]", hover: "hover:bg-[hsl(0,70%,91%)]" },
  };
  const c = colorMap[color];

  return (
    <button
      onClick={onClick}
      className={`kpi-card !p-4 ${c.bg} border-transparent ${c.hover} transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer text-left w-full`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-1.5 h-1.5 rounded-full ${c.accent}`} />
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
      <p className={`text-xl font-bold ${c.text}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>
    </button>
  );
}
