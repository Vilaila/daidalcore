import { motion } from "framer-motion";
import { inventario } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export default function InventarioPage() {
  const { canWrite } = useRole();
  const writable = canWrite("inventario");

  const estadoColor = (e: string) => {
    if (e === "Nuevo") return "bg-pastel-green text-secondary-foreground";
    if (e === "Funciona") return "bg-pastel-yellow";
    if (e === "Averiado") return "bg-pastel-orange";
    return "bg-pastel-red text-accent-foreground";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
          <p className="text-sm text-muted-foreground">Artículos y material del equipo</p>
        </div>
        {writable && <Button size="sm">+ Nuevo Artículo</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {inventario.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="kpi-card space-y-3"
          >
            <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground text-sm">{item.nombre}</h3>
              <span className={`status-badge ${estadoColor(item.estado)}`}>{item.estado}</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Unidades:</span> {item.unidades}</p>
              <p><span className="font-medium text-foreground">Ubicación:</span> {item.ubicacion}</p>
              <p><span className="font-medium text-foreground">Responsable:</span> {item.responsable}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
