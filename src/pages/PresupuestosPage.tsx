import { motion } from "framer-motion";
import { presupuestos, eventosEconomicos } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { Download, Upload, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PresupuestosPage() {
  const { canWrite } = useRole();
  const writable = canWrite("presupuestos");

  const priorityClass = (p: string) => {
    if (p === "Alta") return "priority-alta";
    if (p === "Media") return "priority-media";
    return "priority-baja";
  };

  const estadoColor = (e: string) => {
    if (e === "Aprobado") return "bg-brand-teal-soft text-[hsl(166,40%,25%)]";
    if (e === "Rechazado") return "bg-brand-pink-soft text-[hsl(345,70%,30%)]";
    return "bg-muted text-muted-foreground";
  };

  const getEventoNombre = (id: string) => {
    const evento = eventosEconomicos.find(e => e.id === id);
    return evento ? evento.nombre : "—";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Presupuestos</h1>
          <p className="text-sm text-muted-foreground">Gestión de partidas presupuestarias</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Exportar</Button>
          {writable && <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1" />Importar</Button>}
          {writable && <Button size="sm">+ Nuevo</Button>}
        </div>
      </div>

      <div className="table-container overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Sección</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Empresa</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Referencia</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Uds</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">P.Unit</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Prioridad</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Estado</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden xl:table-cell">Evento Económico</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden xl:table-cell">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {presupuestos.map((p) => (
              <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {p.prioridad === "Alta" && p.estado === "Pendiente" && (
                      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-foreground">{p.nombre}</p>
                        {p.enlace && (
                          <a href={p.enlace} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.descripcion}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.seccion}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.empresa}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell font-mono text-xs">{p.referencia}</td>
                <td className="px-4 py-3 text-right text-foreground">{p.unidades}</td>
                <td className="px-4 py-3 text-right text-foreground">{p.precioUnitario.toFixed(2)} €</td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">{(p.unidades * p.precioUnitario).toFixed(2)} €</td>
                <td className="px-4 py-3 text-center">
                  <span className={`status-badge ${priorityClass(p.prioridad)}`}>{p.prioridad}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`status-badge ${estadoColor(p.estado)}`}>{p.estado}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs">{getEventoNombre(p.eventoEconomico)}</td>
                <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs">{p.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
