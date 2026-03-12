import { motion } from "framer-motion";
import { miembros } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";

export default function MiembrosPage() {
  const { canWrite } = useRole();
  const writable = canWrite("config");

  const estatusColor = (e: string) => {
    if (e === "Activo") return "bg-pastel-green text-secondary-foreground";
    if (e === "Alumni") return "bg-pastel-yellow";
    return "bg-pastel-red text-accent-foreground";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Miembros</h1>
          <p className="text-sm text-muted-foreground">Equipo de Daidalonic</p>
        </div>
        {writable && <Button size="sm">+ Nuevo Miembro</Button>}
      </div>

      <div className="table-container overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nombre</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Estatus</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Titulación</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Centro</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Entrada</th>
            </tr>
          </thead>
          <tbody>
            {miembros.map((m) => (
              <tr key={m.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{m.nombre}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`status-badge ${estatusColor(m.estatus)}`}>{m.estatus}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{m.titulacion}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{m.centro}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{m.fechaEntrada}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
