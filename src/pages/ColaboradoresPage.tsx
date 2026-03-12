import { motion } from "framer-motion";
import { colaboradores } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";

export default function ColaboradoresPage() {
  const { canWrite } = useRole();
  const writable = canWrite("config");

  const tipoColor = (t: string) => {
    if (t === "Universidad") return "bg-pastel-green text-secondary-foreground";
    if (t === "Empresa") return "bg-pastel-yellow";
    return "bg-pastel-red text-accent-foreground";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Colaboradores</h1>
          <p className="text-sm text-muted-foreground">Patrocinadores y colaboradores</p>
        </div>
        {writable && <Button size="sm">+ Nuevo</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colaboradores.map((c) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="kpi-card space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">{c.nombre}</h3>
              <span className={`status-badge ${tipoColor(c.tipo)}`}>{c.tipo}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Estado: <span className="font-medium text-foreground">{c.estadoRelacion}</span>
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
