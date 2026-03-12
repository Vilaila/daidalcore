import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { miembros as initialMiembros } from "@/data/mockData";
import type { Miembro, RolMiembro } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Phone, Mail, Calendar, ChevronDown, ChevronUp, User, Shield, GraduationCap, IdCard, Pencil, Trash2 } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function rolColor(r: RolMiembro) {
  if (r === "Presidente") return "bg-[hsl(35,90%,88%)] text-[hsl(35,80%,25%)]";
  if (r === "Coordinador de Sección") return "bg-[hsl(220,60%,90%)] text-[hsl(220,50%,30%)]";
  if (r === "Coordinador de Proyecto") return "bg-[hsl(280,50%,90%)] text-[hsl(280,40%,30%)]";
  return "bg-muted text-muted-foreground";
}
function estatusColor(e: string) {
  if (e === "Activo") return "bg-[hsl(145,50%,88%)] text-[hsl(145,40%,25%)]";
  if (e === "Alumni") return "bg-[hsl(45,90%,88%)] text-[hsl(35,80%,30%)]";
  return "bg-[hsl(0,70%,90%)] text-[hsl(0,55%,30%)]";
}

const emptyMiembro: Omit<Miembro, "id"> = {
  nombre: "", apellidos: "", seccion: "E-Hardware", rol: "Miembro", estatus: "Activo",
  titulacion: "", centro: "", anioUniversitario: 1, telefono: "", correoUPV: "",
  correoPersonal: "", cumpleanos: "", tipoIdentificacion: "DNI/NIF",
  numeroIdentificacion: "", fechaEntrada: new Date().toISOString().slice(0, 10), fechaSalida: "",
};

export default function MiembrosPage() {
  const { canWrite, role } = useRole();
  const writable = canWrite("config");
  const canFilter = role === "presidente" || role === "coordinador_seccion";
  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState<string>("all");
  const [filterTitulacion, setFilterTitulacion] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [data, setData] = useState<Miembro[]>([...initialMiembros]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Miembro | null>(null);
  const [form, setForm] = useState<Omit<Miembro, "id">>(emptyMiembro);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm({ ...emptyMiembro }); setDialogOpen(true); };
  const openEdit = (m: Miembro) => { setEditing(m); setForm({ ...m }); setDialogOpen(true); };
  const handleSave = () => {
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (editing) {
      setData(prev => prev.map(m => m.id === editing.id ? { ...editing, ...form } : m));
      toast.success("Miembro actualizado");
    } else {
      setData(prev => [...prev, { ...form, id: `m-${Date.now()}` }]);
      toast.success("Miembro creado");
    }
    setDialogOpen(false);
  };
  const handleDelete = () => {
    if (deleteId) { setData(prev => prev.filter(m => m.id !== deleteId)); toast.success("Miembro eliminado"); setDeleteId(null); }
  };

  const titulaciones = [...new Set(data.map(m => m.titulacion))];
  const filtered = data.filter(m => {
    const matchSearch = `${m.nombre} ${m.apellidos}`.toLowerCase().includes(search.toLowerCase()) || m.seccion.toLowerCase().includes(search.toLowerCase());
    const matchRol = filterRol === "all" || m.rol === filterRol;
    const matchTit = filterTitulacion === "all" || m.titulacion === filterTitulacion;
    return matchSearch && matchRol && matchTit;
  });

  const updateField = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Miembros</h1>
          <p className="text-sm text-muted-foreground">Equipo de Daidalonic UPV</p>
        </div>
        {writable && <Button size="sm" onClick={openCreate}>+ Nuevo Miembro</Button>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre o sección…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {canFilter && (
          <>
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filtrar por rol" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="Presidente">Presidente</SelectItem>
                <SelectItem value="Coordinador de Sección">Coord. Sección</SelectItem>
                <SelectItem value="Coordinador de Proyecto">Coord. Proyecto</SelectItem>
                <SelectItem value="Miembro">Miembro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTitulacion} onValueChange={setFilterTitulacion}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filtrar por titulación" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las titulaciones</SelectItem>
                {titulaciones.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(m => {
            const isOpen = expanded === m.id;
            return (
              <motion.div key={m.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="kpi-card overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : m.id)} className="w-full flex items-center gap-4 text-left cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{m.nombre} {m.apellidos}</span>
                      <span className={`status-badge text-[10px] ${rolColor(m.rol)}`}>{m.rol}</span>
                      <span className={`status-badge text-[10px] ${estatusColor(m.estatus)}`}>{m.estatus}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.seccion} · {m.titulacion} · {m.centro}</p>
                  </div>
                  <div className="flex-shrink-0">{isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}</div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="pt-4 mt-4 border-t border-border space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <FieldItem icon={Phone} label="Teléfono" value={m.telefono} />
                          <FieldItem icon={Mail} label="Correo UPV" value={m.correoUPV} />
                          <FieldItem icon={Mail} label="Correo personal" value={m.correoPersonal} />
                          <FieldItem icon={Calendar} label="Cumpleaños" value={m.cumpleanos} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <FieldItem icon={GraduationCap} label="Titulación" value={m.titulacion} />
                          <FieldItem label="Centro" value={m.centro} />
                          <FieldItem label="Año universitario" value={`${m.anioUniversitario}º`} />
                          <FieldItem icon={Shield} label="Sección" value={m.seccion} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <FieldItem icon={IdCard} label={m.tipoIdentificacion} value={m.numeroIdentificacion} />
                          <FieldItem icon={Calendar} label="Fecha entrada" value={m.fechaEntrada} />
                          <FieldItem icon={Calendar} label="Fecha salida" value={m.fechaSalida || "—"} />
                        </div>
                      </div>
                      {writable && (
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" size="sm" onClick={() => openEdit(m)}><Pencil className="w-3 h-3 mr-1" />Editar</Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(m.id)}><Trash2 className="w-3 h-3 mr-1" />Eliminar</Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No se encontraron miembros.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar miembro" : "Nuevo miembro"}</DialogTitle>
            <DialogDescription>{editing ? "Modifica los campos necesarios" : "Rellena los datos del nuevo miembro"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => updateField("nombre", e.target.value)} /></div>
              <div className="grid gap-2"><Label>Apellidos</Label><Input value={form.apellidos} onChange={e => updateField("apellidos", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Sección</Label>
                <Select value={form.seccion} onValueChange={v => updateField("seccion", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="E-Software">E-Software</SelectItem>
                    <SelectItem value="E-Hardware">E-Hardware</SelectItem>
                    <SelectItem value="Diseño">Diseño</SelectItem>
                    <SelectItem value="RRPP-Marketing">RRPP-Marketing</SelectItem>
                    <SelectItem value="RRPP-Corporativa">RRPP-Corporativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Rol</Label>
                <Select value={form.rol} onValueChange={v => updateField("rol", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Presidente">Presidente</SelectItem>
                    <SelectItem value="Coordinador de Sección">Coord. Sección</SelectItem>
                    <SelectItem value="Coordinador de Proyecto">Coord. Proyecto</SelectItem>
                    <SelectItem value="Miembro">Miembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Estatus</Label>
                <Select value={form.estatus} onValueChange={v => updateField("estatus", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Alumni">Alumni</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Año universitario</Label><Input type="number" min={1} max={6} value={form.anioUniversitario} onChange={e => updateField("anioUniversitario", Number(e.target.value))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Titulación</Label><Input value={form.titulacion} onChange={e => updateField("titulacion", e.target.value)} /></div>
              <div className="grid gap-2"><Label>Centro</Label><Input value={form.centro} onChange={e => updateField("centro", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Teléfono</Label><Input value={form.telefono} onChange={e => updateField("telefono", e.target.value)} /></div>
              <div className="grid gap-2"><Label>Correo UPV</Label><Input value={form.correoUPV} onChange={e => updateField("correoUPV", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Correo personal</Label><Input value={form.correoPersonal} onChange={e => updateField("correoPersonal", e.target.value)} /></div>
              <div className="grid gap-2"><Label>Cumpleaños</Label><Input type="date" value={form.cumpleanos} onChange={e => updateField("cumpleanos", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Tipo identificación</Label>
                <Select value={form.tipoIdentificacion} onValueChange={v => updateField("tipoIdentificacion", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI/NIF">DNI/NIF</SelectItem>
                    <SelectItem value="NIE">NIE</SelectItem>
                    <SelectItem value="PASS">PASS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Nº identificación</Label><Input value={form.numeroIdentificacion} onChange={e => updateField("numeroIdentificacion", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Fecha entrada</Label><Input type="date" value={form.fechaEntrada} onChange={e => updateField("fechaEntrada", e.target.value)} /></div>
              <div className="grid gap-2"><Label>Fecha salida</Label><Input type="date" value={form.fechaSalida} onChange={e => updateField("fechaSalida", e.target.value)} /></div>
            </div>
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
            <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
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
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
