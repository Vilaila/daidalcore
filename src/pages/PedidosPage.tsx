import { motion } from "framer-motion";
import { pedidos, presupuestos, eventosEconomicos } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { FileText, Clock, ExternalLink, Package, Pencil, Trash2 } from "lucide-react";
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

function PdfLink({ label, url }: { label: string; url: string }) {
  const hasFile = url && url.length > 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <FileText className={`w-4 h-4 ${hasFile ? "text-primary" : "text-muted-foreground/40"}`} />
      <span className="font-medium text-foreground">{label}:</span>
      {hasFile ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
          Ver PDF <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-muted-foreground text-xs">No adjunto</span>
      )}
    </div>
  );
}

export default function PedidosPage() {
  const { canWrite } = useRole();
  const writable = canWrite("pedidos");
  const [selected, setSelected] = useState<string | null>(null);

  const selectedPedido = pedidos.find(p => p.id === selected);

  const getEventosNombres = (ids: string[]) =>
    ids.map(id => eventosEconomicos.find(e => e.id === id)?.nombre).filter(Boolean).join(", ") || "—";

  const envioColor = (e: string) => {
    if (e === "Recibido") return "bg-brand-teal-soft text-[hsl(166,40%,25%)]";
    if (e === "En tránsito" || e === "Enviado") return "bg-brand-yellow-soft text-[hsl(35,80%,25%)]";
    return "bg-muted text-muted-foreground";
  };

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
      {pedidos.filter(p => p.estadoPedido === "Proforma").map(p => (
        <div key={p.id} className="flex items-center gap-3 bg-brand-yellow-soft rounded-lg px-4 py-3 text-sm">
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
          <StepTracker current={selectedPedido.estadoPedido} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border">
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-foreground">Eventos económicos:</span> <span className="text-muted-foreground">{getEventosNombres(selectedPedido.eventosEconomicos)}</span></p>
              <p><span className="font-medium text-foreground">Fecha de realización:</span> <span className="text-muted-foreground">{selectedPedido.fechaRealizacion}</span></p>
              <p><span className="font-medium text-foreground">Estado del envío:</span> <span className={`status-badge ${envioColor(selectedPedido.estadoEnvio)}`}>{selectedPedido.estadoEnvio}</span></p>
            </div>
            <div className="space-y-2">
              <PdfLink label="Proforma" url={selectedPedido.proformaPdf} />
              <PdfLink label="GEA" url={selectedPedido.geaPdf} />
              <PdfLink label="Factura" url={selectedPedido.facturaPdf} />
            </div>
          </div>

          {selectedPedido.observaciones && (
            <div className="pt-3 border-t border-border">
              <p className="text-sm font-medium text-foreground">Observaciones</p>
              <p className="text-sm text-muted-foreground">{selectedPedido.observaciones}</p>
            </div>
          )}
        </motion.div>
      )}

      <div className="table-container overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Empresa</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Evento Económico</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tipo</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Estado del pedido</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Estado del envío</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Proforma</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">GEA</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Factura</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden xl:table-cell">Fecha</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{p.empresa}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{getEventosNombres(p.eventosEconomicos)}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.tipoCompra}</td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">{p.precioTotal.toFixed(2)} €</td>
                <td className="px-4 py-3 text-center">
                  <span className={`status-badge ${
                    p.estadoPedido === "Terminado" ? "bg-brand-teal-soft text-[hsl(166,40%,25%)]" :
                    p.estadoPedido === "Proforma" ? "bg-brand-yellow-soft text-[hsl(35,80%,25%)]" :
                    "bg-muted text-muted-foreground"
                  }`}>{p.estadoPedido}</span>
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  <span className={`status-badge ${envioColor(p.estadoEnvio)}`}>{p.estadoEnvio}</span>
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  {p.proformaPdf ? (
                    <a href={p.proformaPdf} target="_blank" rel="noopener noreferrer"><FileText className="w-4 h-4 text-primary mx-auto" /></a>
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  {p.geaPdf ? (
                    <a href={p.geaPdf} target="_blank" rel="noopener noreferrer"><FileText className="w-4 h-4 text-primary mx-auto" /></a>
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  {p.facturaPdf ? (
                    <a href={p.facturaPdf} target="_blank" rel="noopener noreferrer"><FileText className="w-4 h-4 text-primary mx-auto" /></a>
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden xl:table-cell">{p.fechaRealizacion}</td>
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
