import { motion } from "framer-motion";
import { pedidos, presupuestos } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { FileText, Clock } from "lucide-react";
import { useState } from "react";

const STEPS = ["Pendiente de correo", "Proforma", "Solicitud empezada", "Factura", "Terminado"];

function StepTracker({ current }: { current: string }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-1 w-full">
      {STEPS.map((step, i) => (
        <div key={step} className="flex-1 flex flex-col items-center">
          <div className={`w-full h-2 rounded-full mb-1 ${
            i < idx ? "step-completed" : i === idx ? "step-active" : "step-pending"
          }`} />
          <span className="text-[10px] text-muted-foreground text-center leading-tight">{step}</span>
        </div>
      ))}
    </div>
  );
}

export default function PedidosPage() {
  const { canWrite } = useRole();
  const writable = canWrite("pedidos");
  const [selected, setSelected] = useState<string | null>(null);

  const selectedPedido = pedidos.find(p => p.id === selected);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
          <p className="text-sm text-muted-foreground">Agrupación de presupuestos en pedidos</p>
        </div>
        {writable && <Button size="sm">+ Nuevo Pedido</Button>}
      </div>

      {/* Alerta pedidos estancados */}
      {pedidos.filter(p => p.estado === "Proforma").map(p => (
        <div key={p.id} className="flex items-center gap-3 bg-pastel-yellow rounded-lg px-4 py-3 text-sm">
          <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(35, 95%, 45%)" }} />
          <span><strong>Alerta:</strong> Pedido a "{p.empresa}" estancado en Proforma</span>
        </div>
      ))}

      {selectedPedido && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="kpi-card space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Pedido: {selectedPedido.empresa}</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
          </div>
          <StepTracker current={selectedPedido.estado} />
        </motion.div>
      )}

      <div className="table-container overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Empresa</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tipo</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Estado</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">PDFs</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{p.empresa}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.tipoCompra}</td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">{p.precioTotal.toFixed(2)} €</td>
                <td className="px-4 py-3 text-center">
                  <span className={`status-badge ${
                    p.estado === "Terminado" ? "bg-pastel-green text-secondary-foreground" :
                    p.estado === "Proforma" ? "bg-pastel-yellow" :
                    "bg-muted text-muted-foreground"
                  }`}>{p.estado}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    <FileText className="w-4 h-4 text-muted-foreground" title="Proforma" />
                    <FileText className="w-4 h-4 text-muted-foreground" title="GEA" />
                    <FileText className="w-4 h-4 text-muted-foreground" title="Factura" />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(p.id)}>Ver</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
