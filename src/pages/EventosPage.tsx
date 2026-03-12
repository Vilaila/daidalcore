import { motion } from "framer-motion";
import { eventosEconomicos } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";

export default function EventosPage() {
  const { canWrite } = useRole();
  const writable = canWrite("eventos");

  const estadoColor = (e: string) => {
    if (e === "Terminado") return "bg-pastel-green text-secondary-foreground";
    if (e === "En progreso") return "bg-pastel-yellow";
    return "bg-muted text-muted-foreground";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Eventos Económicos</h1>
          <p className="text-sm text-muted-foreground">Registro de fuentes de ingreso</p>
        </div>
        {writable && <Button size="sm">+ Nuevo Evento</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventosEconomicos.map((e) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="kpi-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground">{e.nombre}</h3>
              <span className={`status-badge ${estadoColor(e.estado)}`}>{e.estado}</span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Colaborador:</span> {e.colaborador}</p>
              <p><span className="font-medium text-foreground">Periodo:</span> {e.fechaInicio} → {e.fechaFin}</p>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Presupuesto disponible</p>
              <p className="text-lg font-bold text-foreground">{e.presupuestoDisponible.toLocaleString("es-ES")} €</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
