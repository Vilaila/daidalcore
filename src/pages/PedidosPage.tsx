import { useState } from "react";
import { motion } from "framer-motion";
import { pedidos as initialPedidos, presupuestos, eventosEconomicos } from "@/data/mockData";
import type { Pedido } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Clock, ExternalLink, Pencil, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const STEPS = ["Pendiente de correo", "Proforma", "Solicitud empezada", "Factura", "Terminado"];

function StepTracker({ current }: { current: string }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-1 w-full">
      {STEPS.map((step, i) => (
        <div key={step} className="flex-1 flex flex-col items-center">
          <div className={`w-full h-2 rounded-full mb-1 ${i < idx ? "step-completed" : i === idx ? "step-active" : "step-pending"}`} />
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
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">Ver PDF <ExternalLink className="w-3 h-3" /></a>
      ) : (
        <span className="text-muted-foreground text-xs">No adjunto</span>
      )}
    </div>
  );
}

const emptyPedido: Omit<Pedido, "id"> = {
  empresa: "", tipoCompra: "GEA", precioTotal: 0, presupuestosIds: [], eventosEconomicos: [],
  proformaPdf: "", geaPdf: "", facturaPdf: "", estadoPedido: "Pendiente de correo",
  estadoEnvio: "Pendiente", fechaRealizacion: new Date().toISOString().slice(0, 10), observaciones: "",
};

export default function PedidosPage() {
  const { canWrite } = useRole();
  const writable = canWrite("pedidos");
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<Pedido[]>([...initialPedidos]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Pedido | null>(null);
  const [form, setForm] = useState<Omit<Pedido, "id">>(emptyPedido);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm({ ...emptyPedido }); setDialogOpen(true); };
  const openEdit = (p: Pedido) => { setEditing(p); setForm({ ...p }); setDialogOpen(true); };
  const handleSave = () => {
    if (!form.empresa.trim()) { toast.error("La empresa es obligatoria"); return; }
    if (editing) {
      setData(prev => prev.map(p => p.id === editing.id ? { ...editing, ...form } : p));
      toast.success("Pedido actualizado");
    } else {
      setData(prev => [...prev, { ...form, id: `o-${Date.now()}` }]);
      toast.success("Pedido creado");
    }
    setDialogOpen(false);
  };
  const handleDelete = () => {
    if (deleteId) { setData(prev => prev.filter(p => p.id !== deleteId)); toast.success("Pedido eliminado"); setDeleteId(null); }
  };

  const selectedPedido = data.find(p => p.id === selected);
  const getEventosNombres = (ids: string[]) => ids.map(id => eventosEconomicos.find(e => e.id === id)?.nombre).filter(Boolean).join(", ") || "—";
  const envioColor = (e: string) => {
    if (e === "Recibido") return "bg-brand-teal-soft text-[hsl(166,40%,25%)]";
    if (e === "En tránsito" || e === "Enviado") return "bg-brand-yellow-soft text-[hsl(35,80%,25%)]";
    return "bg-muted text-muted-foreground";
  };

  const updateField = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
          <p className="text-sm text-muted-foreground">Agrupación de presupuestos en pedidos</p>
        </div>
        {writable && <Button size="sm" onClick={openCreate}>+ Nuevo Pedido</Button>}
      </div>

      {data.filter(p => p.estadoPedido === "Proforma").map(p => (
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
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Evento</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tipo</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Estado pedido</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Envío</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Detalle</th>
              {writable && <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{p.empresa}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{getEventosNombres(p.eventosEconomicos)}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.tipoCompra}</td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">{p.precioTotal.toFixed(2)} €</td>
                <td className="px-4 py-3 text-center">
                  <span className={`status-badge ${p.estadoPedido === "Terminado" ? "bg-brand-teal-soft text-[hsl(166,40%,25%)]" : p.estadoPedido === "Proforma" ? "bg-brand-yellow-soft text-[hsl(35,80%,25%)]" : "bg-muted text-muted-foreground"}`}>{p.estadoPedido}</span>
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell"><span className={`status-badge ${envioColor(p.estadoEnvio)}`}>{p.estadoEnvio}</span></td>
                <td className="px-4 py-3 text-center"><Button variant="ghost" size="sm" onClick={() => setSelected(p.id)}>Ver</Button></td>
                {writable && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar pedido" : "Nuevo pedido"}</DialogTitle>
            <DialogDescription>{editing ? "Modifica los campos necesarios" : "Rellena los datos del nuevo pedido"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Empresa *</Label><Input value={form.empresa} onChange={e => updateField("empresa", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Tipo de compra</Label>
                <Select value={form.tipoCompra} onValueChange={v => updateField("tipoCompra", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GEA">GEA</SelectItem>
                    <SelectItem value="Adelantado">Adelantado</SelectItem>
                    <SelectItem value="A terceros">A terceros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Precio total (€)</Label><Input type="number" min={0} step={0.01} value={form.precioTotal} onChange={e => updateField("precioTotal", Number(e.target.value))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Estado del pedido</Label>
                <Select value={form.estadoPedido} onValueChange={v => updateField("estadoPedido", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STEPS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Estado del envío</Label>
                <Select value={form.estadoEnvio} onValueChange={v => updateField("estadoEnvio", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Enviado">Enviado</SelectItem>
                    <SelectItem value="En tránsito">En tránsito</SelectItem>
                    <SelectItem value="Recibido">Recibido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2"><Label>Fecha de realización</Label><Input type="date" value={form.fechaRealizacion} onChange={e => updateField("fechaRealizacion", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Observaciones</Label><Textarea value={form.observaciones} onChange={e => updateField("observaciones", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Guardar cambios" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pedido?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
