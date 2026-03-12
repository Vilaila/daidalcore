import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colaboradores as initialColaboradores } from "@/data/mockData";
import type { Colaborador } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, FileText, ExternalLink, Calendar, ChevronDown, ChevronUp, Handshake, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/contexts/RoleContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function tipoColor(t: string) {
  if (t === "Universidad") return "bg-[hsl(145,50%,88%)] text-[hsl(145,40%,25%)]";
  if (t === "Empresa") return "bg-[hsl(45,90%,88%)] text-[hsl(35,80%,30%)]";
  return "bg-[hsl(0,70%,90%)] text-[hsl(0,55%,30%)]";
}
function estadoColor(e: string) {
  if (e === "Activo") return "bg-[hsl(145,50%,88%)] text-[hsl(145,40%,25%)]";
  if (e === "Pendiente") return "bg-[hsl(45,90%,88%)] text-[hsl(35,80%,30%)]";
  return "bg-muted text-muted-foreground";
}

const emptyColaborador: Omit<Colaborador, "id"> = {
  nombre: "", descripcion: "", tipo: "Empresa", estadoRelacion: "Pendiente",
  correo: "", telefono: "", condiciones: "", observaciones: "", documentacion: "",
  fechaInicio: new Date().toISOString().slice(0, 10),
};

export default function ColaboradoresPage() {
  const { canWrite } = useRole();
  const writable = canWrite("config");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [data, setData] = useState<Colaborador[]>([...initialColaboradores]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Colaborador | null>(null);
  const [form, setForm] = useState<Omit<Colaborador, "id">>(emptyColaborador);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm({ ...emptyColaborador }); setDialogOpen(true); };
  const openEdit = (c: Colaborador) => { setEditing(c); setForm({ ...c }); setDialogOpen(true); };
  const handleSave = () => {
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (editing) {
      setData(prev => prev.map(c => c.id === editing.id ? { ...editing, ...form } : c));
      toast.success("Colaborador actualizado");
    } else {
      setData(prev => [...prev, { ...form, id: `c-${Date.now()}` }]);
      toast.success("Colaborador creado");
    }
    setDialogOpen(false);
  };
  const handleDelete = () => {
    if (deleteId) { setData(prev => prev.filter(c => c.id !== deleteId)); toast.success("Colaborador eliminado"); setDeleteId(null); }
  };

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Colaboradores</h1>
          <p className="text-sm text-muted-foreground">Patrocinadores y colaboradores</p>
        </div>
        {writable && <Button size="sm" onClick={openCreate}>+ Nuevo</Button>}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {data.map(c => {
            const isOpen = expanded === c.id;
            return (
              <motion.div key={c.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="kpi-card overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : c.id)} className="w-full flex items-center gap-4 text-left cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"><Handshake className="w-5 h-5 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{c.nombre}</span>
                      <span className={`status-badge text-[10px] ${tipoColor(c.tipo)}`}>{c.tipo}</span>
                      <span className={`status-badge text-[10px] ${estadoColor(c.estadoRelacion)}`}>{c.estadoRelacion}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.descripcion}</p>
                  </div>
                  <div className="flex-shrink-0">{isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}</div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="pt-4 mt-4 border-t border-border space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <FieldItem icon={Mail} label="Correo" value={c.correo} />
                          <FieldItem icon={Phone} label="Teléfono" value={c.telefono} />
                          <FieldItem icon={Calendar} label="Inicio colaboración" value={c.fechaInicio} />
                        </div>
                        <div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Descripción</p><p className="text-sm text-foreground">{c.descripcion}</p></div>
                        <div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Condiciones</p><p className="text-sm text-foreground">{c.condiciones || "—"}</p></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Observaciones</p><p className="text-sm text-muted-foreground">{c.observaciones || "—"}</p></div>
                          <div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Documentación</p>
                            {c.documentacion ? <a href={c.documentacion} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">Ver documentos <ExternalLink className="w-3 h-3" /></a> : <p className="text-sm text-muted-foreground">—</p>}
                          </div>
                        </div>
                        {writable && (
                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" size="sm" onClick={() => openEdit(c)}><Pencil className="w-3 h-3 mr-1" />Editar</Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(c.id)}><Trash2 className="w-3 h-3 mr-1" />Eliminar</Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar colaborador" : "Nuevo colaborador"}</DialogTitle>
            <DialogDescription>{editing ? "Modifica los campos necesarios" : "Rellena los datos del nuevo colaborador"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => updateField("nombre", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Descripción</Label><Textarea value={form.descripcion} onChange={e => updateField("descripcion", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={v => updateField("tipo", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Universidad">Universidad</SelectItem>
                    <SelectItem value="Empresa">Empresa</SelectItem>
                    <SelectItem value="Particular">Particular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Estado relación</Label>
                <Select value={form.estadoRelacion} onValueChange={v => updateField("estadoRelacion", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Correo</Label><Input value={form.correo} onChange={e => updateField("correo", e.target.value)} /></div>
              <div className="grid gap-2"><Label>Teléfono</Label><Input value={form.telefono} onChange={e => updateField("telefono", e.target.value)} /></div>
            </div>
            <div className="grid gap-2"><Label>Fecha inicio</Label><Input type="date" value={form.fechaInicio} onChange={e => updateField("fechaInicio", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Condiciones</Label><Textarea value={form.condiciones} onChange={e => updateField("condiciones", e.target.value)} /></div>
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
            <AlertDialogTitle>¿Eliminar colaborador?</AlertDialogTitle>
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

function FieldItem({ icon: Icon, label, value }: { icon?: typeof Mail; label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 flex items-center gap-1">{Icon && <Icon className="w-3 h-3" />} {label}</p>
      <p className="text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}
