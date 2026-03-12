import { motion } from "framer-motion";
import { empresas } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";

export default function EmpresasPage() {
  const { canWrite } = useRole();
  const writable = canWrite("config");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empresas</h1>
          <p className="text-sm text-muted-foreground">Directorio de proveedores</p>
        </div>
        {writable && <Button size="sm">+ Nueva Empresa</Button>}
      </div>

      <div className="table-container overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">CIF/VAT</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Contacto</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Email</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Valoración</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Pago</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((e) => (
              <tr key={e.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{e.nombre}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{e.cif}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{e.contacto}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{e.email}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="font-medium text-foreground">{e.valoracion}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{e.formaPago}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
