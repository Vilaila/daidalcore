import { useState } from "react";
import { motion } from "framer-motion";
import { eventosEconomicos, EventoEconomico } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, ChevronDown, ChevronUp } from "lucide-react";

type FilterType = "todos" | "en_progreso" | "sin_comenzar" | "terminados";

export default function EventosPage() {
  const { canWrite } = useRole();
  const writable = canWrite("eventos");
  const [filter, setFilter] = useState<FilterType>("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const estadoColor = (e: string) => {
    if (e === "Terminado") return "bg-pastel-green text-secondary-foreground";
    if (e === "En progreso") return "bg-pastel-yellow";
    return "bg-muted text-muted-foreground";
  };

  const filtered = eventosEconomicos.filter((e) => {
    if (filter === "en_progreso") return e.estado === "En progreso";
    if (filter === "sin_comenzar") return e.estado === "Sin comenzar";
    if (filter === "terminados") return e.estado === "Terminado";
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Eventos Económicos</h1>
          <p className="text-sm text-muted-foreground">Registro de fuentes de ingreso</p>
        </div>
        {writable && <Button size="sm">+ Nuevo Evento</Button>}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="en_progreso">En progreso</TabsTrigger>
          <TabsTrigger value="sin_comenzar">Sin comenzar</TabsTrigger>
          <TabsTrigger value="terminados">Terminados</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No hay eventos en esta categoría</p>
        )}
        {filtered.map((e) => {
          const isExpanded = expandedId === e.id;
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="kpi-card"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : e.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{e.nombre}</h3>
                  <span className={`status-badge ${estadoColor(e.estado)} flex-shrink-0`}>{e.estado}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-lg font-bold text-foreground">{e.presupuestoDisponible.toLocaleString("es-ES")} €</p>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-border space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-foreground">Colaborador:</span> <span className="text-muted-foreground">{e.colaborador}</span></p>
                      <p><span className="font-medium text-foreground">Periodo:</span> <span className="text-muted-foreground">{e.fechaInicio} → {e.fechaFin}</span></p>
                      <p><span className="font-medium text-foreground">Presupuesto disponible:</span> <span className="text-muted-foreground">{e.presupuestoDisponible.toLocaleString("es-ES")} €</span></p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium text-foreground">Descripción</p>
                        <p className="text-muted-foreground">{e.descripcion || "Sin descripción"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Observaciones</p>
                        <p className="text-muted-foreground">{e.observaciones || "Sin observaciones"}</p>
                      </div>
                    </div>
                  </div>
                  {writable && (
                    <div className="flex justify-end pt-2">
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-3 h-3 mr-1" />Editar
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
