import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { inventario as initialInventario } from "@/data/mockData";
import type { ArticuloInventario } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, ChevronDown, ChevronUp, ExternalLink, Search, Pencil, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const emptyArticulo: Omit<ArticuloInventario, "id"> = {
  nombre: "", descripcion: "", unidades: 1, ubicacion: "", responsable: "",
  estado: "Nuevo", foto: "", presupuestoId: "", seccion: "E-Hardware",
  enlaceWeb: "", observaciones: "", fecha: new Date().toISOString().slice(0, 10),
};

export default function InventarioPage() {
  const { canWrite } = useRole();
  const writable = canWrite("inventario");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [data, setData] = useState<ArticuloInventario[]>([...initialInventario]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ArticuloInventario | null>(null);
  const [form, setForm] = useState<Omit<ArticuloInventario, "id">>(emptyArticulo);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm({ ...emptyArticulo }); setDialogOpen(true); };
  const openEdit = (item: ArticuloInventario) => { setEditing(item); setForm({ ...item }); setDialogOpen(true); };
  const handleSave = () => {
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (editing) {
      setData(prev => prev.map(i => i.id === editing.id ? { ...editing, ...form } : i));
      toast.success("Artículo actualizado");
    } else {
      setData(prev => [...prev, { ...form, id: `i-${Date.now()}` }]);
      toast.success("Artículo creado");
    }
    setDialogOpen(false);
  };
  const handleDelete = () => {
    if (deleteId) { setData(prev => prev.filter(i => i.id !== deleteId)); toast.success("Artículo eliminado"); setDeleteId(null); }
  };

  const estadoColor = (e: string) => {
    if (e === "Nuevo") return "bg-brand-teal-soft text-[hsl(166,40%,25%)]";
    if (e === "Funciona") return "bg-brand-yellow-soft text-[hsl(35,80%,25%)]";
    if (e === "Averiado") return "bg-brand-yellow-soft text-[hsl(35,80%,25%)]";
    return "bg-brand-pink-soft text-[hsl(345,70%,30%)]";
  };

  const filtered = data.filter(item => item.nombre.toLowerCase().includes(search.toLowerCase()));
  const updateField = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
          <p className="text-sm text-muted-foreground">Artículos y material del equipo</p>
        </div>
        {writable && <Button size="sm" onClick={openCreate}>+ Nuevo Artículo</Button>}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar artículo por nombre..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No se encontraron artículos</p>}
        <AnimatePresence>
          {filtered.map(item => {
            const isExpanded = expandedId === item.id;
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="kpi-card">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{item.nombre}</h3>
                    <span className={`status-badge ${estadoColor(item.estado)} flex-shrink-0`}>{item.estado}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">{item.unidades} uds</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground hidden md:inline">{item.seccion}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
                {isExpanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                        {item.foto ? <img src={item.foto} alt={item.nombre} className="w-full h-full object-cover rounded-lg" /> : <Camera className="w-8 h-8 text-muted-foreground" />}
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-foreground">Descripción:</span> <span className="text-muted-foreground">{item.descripcion}</span></p>
                        <p><span className="font-medium text-foreground">Sección:</span> <span className="text-muted-foreground">{item.seccion}</span></p>
                        <p><span className="font-medium text-foreground">Unidades:</span> <span className="text-muted-foreground">{item.unidades}</span></p>
                        <p><span className="font-medium text-foreground">Ubicación:</span> <span className="text-muted-foreground">{item.ubicacion}</span></p>
                        <p><span className="font-medium text-foreground">Responsable:</span> <span className="text-muted-foreground">{item.responsable}</span></p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-foreground">Estado:</span> <span className={`status-badge ${estadoColor(item.estado)}`}>{item.estado}</span></p>
                        <p><span className="font-medium text-foreground">Fecha:</span> <span className="text-muted-foreground">{item.fecha}</span></p>
                        {item.enlaceWeb && (
                          <p><span className="font-medium text-foreground">Enlace web:</span>{" "}
                            <a href={item.enlaceWeb} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Ver en web <ExternalLink className="w-3 h-3" /></a>
                          </p>
                        )}
                        {item.observaciones && <div><p className="font-medium text-foreground">Observaciones:</p><p className="text-muted-foreground">{item.observaciones}</p></div>}
                      </div>
                    </div>
                    {writable && (
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil className="w-3 h-3 mr-1" />Editar</Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(item.id)}><Trash2 className="w-3 h-3 mr-1" />Eliminar</Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar artículo" : "Nuevo artículo"}</DialogTitle>
            <DialogDescription>{editing ? "Modifica los campos necesarios" : "Rellena los datos del nuevo artículo"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => updateField("nombre", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Descripción</Label><Textarea value={form.descripcion} onChange={e => updateField("descripcion", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Unidades</Label><Input type="number" min={0} value={form.unidades} onChange={e => updateField("unidades", Number(e.target.value))} /></div>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Ubicación</Label><Input value={form.ubicacion} onChange={e => updateField("ubicacion", e.target.value)} /></div>
              <div className="grid gap-2"><Label>Responsable</Label><Input value={form.responsable} onChange={e => updateField("responsable", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Estado</Label>
                <Select value={form.estado} onValueChange={v => updateField("estado", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nuevo">Nuevo</SelectItem>
                    <SelectItem value="Funciona">Funciona</SelectItem>
                    <SelectItem value="Averiado">Averiado</SelectItem>
                    <SelectItem value="Roto">Roto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={e => updateField("fecha", e.target.value)} /></div>
            </div>
            <div className="grid gap-2"><Label>Enlace web</Label><Input value={form.enlaceWeb} onChange={e => updateField("enlaceWeb", e.target.value)} /></div>
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
            <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
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
