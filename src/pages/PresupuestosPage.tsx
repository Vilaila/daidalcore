import { useState } from "react";
import { motion } from "framer-motion";
import { presupuestos as initialPresupuestos, eventosEconomicos } from "@/data/mockData";
import type { Presupuesto } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { Download, Upload, AlertTriangle, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const emptyPresupuesto: Omit<Presupuesto, "id"> = {
  nombre: "", descripcion: "", seccion: "Electrónica", empresa: "", referencia: "",
  enlace: "", unidades: 1, precioUnitario: 0, prioridad: "Media", estado: "Pendiente",
  eventoEconomico: "e1", fecha: new Date().toISOString().slice(0, 10),
};

export default function PresupuestosPage() {
  const { canWrite } = useRole();
  const writable = canWrite("presupuestos");
  const [data, setData] = useState<Presupuesto[]>([...initialPresupuestos]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Presupuesto | null>(null);
  const [form, setForm] = useState<Omit<Presupuesto, "id">>(emptyPresupuesto);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm({ ...emptyPresupuesto }); setDialogOpen(true); };
  const openEdit = (p: Presupuesto) => { setEditing(p); setForm({ ...p }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (editing) {
      setData(prev => prev.map(p => p.id === editing.id ? { ...editing, ...form } : p));
      toast.success("Presupuesto actualizado");
    } else {
      setData(prev => [...prev, { ...form, id: `p-${Date.now()}` }]);
      toast.success("Presupuesto creado");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setData(prev => prev.filter(p => p.id !== deleteId));
      toast.success("Presupuesto eliminado");
      setDeleteId(null);
    }
  };

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

  const getEventoNombre = (id: string) => eventosEconomicos.find(e => e.id === id)?.nombre ?? "—";

  const updateField = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

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
          {writable && <Button size="sm" onClick={openCreate}>+ Nuevo</Button>}
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
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden xl:table-cell">Evento</th>
              {writable && <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {p.prioridad === "Alta" && p.estado === "Pendiente" && <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />}
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-foreground">{p.nombre}</p>
                        {p.enlace && <a href={p.enlace} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80"><ExternalLink className="w-3 h-3" /></a>}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.descripcion}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.seccion}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.empresa}</td>
                <td className="px-4 py-3 text-right text-foreground">{p.unidades}</td>
                <td className="px-4 py-3 text-right text-foreground">{p.precioUnitario.toFixed(2)} €</td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">{(p.unidades * p.precioUnitario).toFixed(2)} €</td>
                <td className="px-4 py-3 text-center"><span className={`status-badge ${priorityClass(p.prioridad)}`}>{p.prioridad}</span></td>
                <td className="px-4 py-3 text-center"><span className={`status-badge ${estadoColor(p.estado)}`}>{p.estado}</span></td>
                <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs">{getEventoNombre(p.eventoEconomico)}</td>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar presupuesto" : "Nuevo presupuesto"}</DialogTitle>
            <DialogDescription>{editing ? "Modifica los campos necesarios" : "Rellena los datos del nuevo presupuesto"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => updateField("nombre", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Descripción</Label><Input value={form.descripcion} onChange={e => updateField("descripcion", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Sección</Label>
                <Select value={form.seccion} onValueChange={v => updateField("seccion", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electrónica">Electrónica</SelectItem>
                    <SelectItem value="Mecánica">Mecánica</SelectItem>
                    <SelectItem value="Fabricación">Fabricación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Empresa</Label><Input value={form.empresa} onChange={e => updateField("empresa", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Unidades</Label><Input type="number" min={1} value={form.unidades} onChange={e => updateField("unidades", Number(e.target.value))} /></div>
              <div className="grid gap-2"><Label>Precio unitario (€)</Label><Input type="number" min={0} step={0.01} value={form.precioUnitario} onChange={e => updateField("precioUnitario", Number(e.target.value))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Prioridad</Label>
                <Select value={form.prioridad} onValueChange={v => updateField("prioridad", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Estado</Label>
                <Select value={form.estado} onValueChange={v => updateField("estado", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Aprobado">Aprobado</SelectItem>
                    <SelectItem value="Rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2"><Label>Evento económico</Label>
              <Select value={form.eventoEconomico} onValueChange={v => updateField("eventoEconomico", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {eventosEconomicos.map(e => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Referencia</Label><Input value={form.referencia} onChange={e => updateField("referencia", e.target.value)} /></div>
              <div className="grid gap-2"><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={e => updateField("fecha", e.target.value)} /></div>
            </div>
            <div className="grid gap-2"><Label>Enlace</Label><Input value={form.enlace} onChange={e => updateField("enlace", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Guardar cambios" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
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
