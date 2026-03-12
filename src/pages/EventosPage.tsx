import { useState } from "react";
import { motion } from "framer-motion";
import { eventosEconomicos as initialEventos } from "@/data/mockData";
import type { EventoEconomico } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type FilterType = "todos" | "en_progreso" | "sin_comenzar" | "terminados";

const emptyEvento: Omit<EventoEconomico, "id"> = {
  nombre: "", descripcion: "", observaciones: "", colaborador: "",
  fechaInicio: new Date().toISOString().slice(0, 10), fechaFin: "",
  estado: "Sin comenzar", presupuestoDisponible: 0,
};

export default function EventosPage() {
  const { canWrite } = useRole();
  const writable = canWrite("eventos");
  const [filter, setFilter] = useState<FilterType>("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [data, setData] = useState<EventoEconomico[]>([...initialEventos]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventoEconomico | null>(null);
  const [form, setForm] = useState<Omit<EventoEconomico, "id">>(emptyEvento);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm({ ...emptyEvento }); setDialogOpen(true); };
  const openEdit = (e: EventoEconomico) => { setEditing(e); setForm({ ...e }); setDialogOpen(true); };
  const handleSave = () => {
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (editing) {
      setData(prev => prev.map(e => e.id === editing.id ? { ...editing, ...form } : e));
      toast.success("Evento actualizado");
    } else {
      setData(prev => [...prev, { ...form, id: `e-${Date.now()}` }]);
      toast.success("Evento creado");
    }
    setDialogOpen(false);
  };
  const handleDelete = () => {
    if (deleteId) { setData(prev => prev.filter(e => e.id !== deleteId)); toast.success("Evento eliminado"); setDeleteId(null); }
  };

  const estadoColor = (e: string) => {
    if (e === "Terminado") return "bg-brand-teal-soft text-[hsl(166,40%,25%)]";
    if (e === "En progreso") return "bg-brand-yellow-soft text-[hsl(35,80%,25%)]";
    return "bg-muted text-muted-foreground";
  };

  const filtered = data.filter((e) => {
    if (filter === "en_progreso") return e.estado === "En progreso";
    if (filter === "sin_comenzar") return e.estado === "Sin comenzar";
    if (filter === "terminados") return e.estado === "Terminado";
    return true;
  });

  const updateField = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Eventos Económicos</h1>
          <p className="text-sm text-muted-foreground">Registro de fuentes de ingreso</p>
        </div>
        {writable && <Button size="sm" onClick={openCreate}>+ Nuevo Evento</Button>}
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
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No hay eventos en esta categoría</p>}
        {filtered.map((e) => {
          const isExpanded = expandedId === e.id;
          return (
            <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="kpi-card">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : e.id)}>
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
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-foreground">Colaborador:</span> <span className="text-muted-foreground">{e.colaborador}</span></p>
                      <p><span className="font-medium text-foreground">Periodo:</span> <span className="text-muted-foreground">{e.fechaInicio} → {e.fechaFin}</span></p>
                      <p><span className="font-medium text-foreground">Presupuesto disponible:</span> <span className="text-muted-foreground">{e.presupuestoDisponible.toLocaleString("es-ES")} €</span></p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><p className="font-medium text-foreground">Descripción</p><p className="text-muted-foreground">{e.descripcion || "Sin descripción"}</p></div>
                      <div><p className="font-medium text-foreground">Observaciones</p><p className="text-muted-foreground">{e.observaciones || "Sin observaciones"}</p></div>
                    </div>
                  </div>
                  {writable && (
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(e)}><Edit2 className="w-3 h-3 mr-1" />Editar</Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(e.id)}><Trash2 className="w-3 h-3 mr-1" />Eliminar</Button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar evento" : "Nuevo evento económico"}</DialogTitle>
            <DialogDescription>{editing ? "Modifica los campos necesarios" : "Rellena los datos del nuevo evento"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => updateField("nombre", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Descripción</Label><Textarea value={form.descripcion} onChange={e => updateField("descripcion", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Colaborador</Label><Input value={form.colaborador} onChange={e => updateField("colaborador", e.target.value)} /></div>
              <div className="grid gap-2"><Label>Presupuesto (€)</Label><Input type="number" min={0} value={form.presupuestoDisponible} onChange={e => updateField("presupuestoDisponible", Number(e.target.value))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Fecha inicio</Label><Input type="date" value={form.fechaInicio} onChange={e => updateField("fechaInicio", e.target.value)} /></div>
              <div className="grid gap-2"><Label>Fecha fin</Label><Input type="date" value={form.fechaFin} onChange={e => updateField("fechaFin", e.target.value)} /></div>
            </div>
            <div className="grid gap-2"><Label>Estado</Label>
              <Select value={form.estado} onValueChange={v => updateField("estado", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sin comenzar">Sin comenzar</SelectItem>
                  <SelectItem value="En progreso">En progreso</SelectItem>
                  <SelectItem value="Terminado">Terminado</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
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
