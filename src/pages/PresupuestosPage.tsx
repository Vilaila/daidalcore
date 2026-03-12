import { motion } from "framer-motion";
import { presupuestos } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PresupuestosPage() {
  const { canWrite } = useRole();
  const writable = canWrite("presupuestos");

  const priorityClass = (p: string) => {
    if (p === "Alta") return "priority-alta";
    if (p === "Media") return "priority-media";
    return "priority-baja";
  };

  const estadoColor = (e: string) => {
    if (e === "Aprobado") return "bg-pastel-green text-secondary-foreground";
    if (e === "Rechazado") return "bg-pastel-red text-accent-foreground";
    return "bg-muted text-muted-foreground";
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
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Uds</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">P.Unit</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Prioridad</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Estado</th>
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
                      <p className="font-medium text-foreground">{p.nombre}</p>
                      <p className="text-xs text-muted-foreground">{p.descripcion}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.seccion}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.empresa}</td>
                <td className="px-4 py-3 text-right text-foreground">{p.unidades}</td>
                <td className="px-4 py-3 text-right text-foreground">{p.precioUnitario.toFixed(2)} €</td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">{(p.unidades * p.precioUnitario).toFixed(2)} €</td>
                <td className="px-4 py-3 text-center">
                  <span className={`status-badge ${priorityClass(p.prioridad)}`}>{p.prioridad}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`status-badge ${estadoColor(p.estado)}`}>{p.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
