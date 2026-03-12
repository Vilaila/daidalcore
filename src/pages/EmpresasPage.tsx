import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { empresas as initialEmpresas } from "@/data/mockData";
import type { Empresa } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, Globe, Phone, Mail, FileText, ExternalLink, ChevronDown, ChevronUp, Building2, Calendar, Pencil, Trash2 } from "lucide-react";
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

function StarRating({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-muted-foreground italic">Aún no</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= value ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />)}
    </div>
  );
}

function relacionColor(r: string) {
  if (r.startsWith("Alta")) return "bg-[hsl(145,50%,88%)] text-[hsl(145,40%,25%)]";
  if (r === "Acuerdo Marco") return "bg-[hsl(220,60%,90%)] text-[hsl(220,50%,30%)]";
  return "bg-muted text-muted-foreground";
}

const emptyEmpresa: Omit<Empresa, "id"> = {
  nombre: "", descripcion: "", seccion: "E-Hardware", cif: "", contacto: "",
  email: "", telefono: "", web: "", relacionUPV: "No alta – España",
  facturar: "Factura", valoracion: null, formaPago: "", observaciones: "",
  documentacion: "", fecha: new Date().toISOString().slice(0, 10),
};

export default function EmpresasPage() {
  const { canWrite } = useRole();
  const writable = canWrite("config");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [data, setData] = useState<Empresa[]>([...initialEmpresas]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Empresa | null>(null);
  const [form, setForm] = useState<Omit<Empresa, "id">>(emptyEmpresa);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm({ ...emptyEmpresa }); setDialogOpen(true); };
  const openEdit = (e: Empresa) => { setEditing(e); setForm({ ...e }); setDialogOpen(true); };
  const handleSave = () => {
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (editing) {
      setData(prev => prev.map(e => e.id === editing.id ? { ...editing, ...form } : e));
      toast.success("Empresa actualizada");
    } else {
      setData(prev => [...prev, { ...form, id: `emp-${Date.now()}` }]);
      toast.success("Empresa creada");
    }
    setDialogOpen(false);
  };
  const handleDelete = () => {
    if (deleteId) { setData(prev => prev.filter(e => e.id !== deleteId)); toast.success("Empresa eliminada"); setDeleteId(null); }
  };

  const filtered = data.filter(e =>
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    e.descripcion.toLowerCase().includes(search.toLowerCase()) ||
    e.seccion.toLowerCase().includes(search.toLowerCase())
  );

  const updateField = (field: string, value: string | number | null) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empresas</h1>
          <p className="text-sm text-muted-foreground">Directorio de proveedores</p>
        </div>
        {writable && <Button size="sm" onClick={openCreate}>+ Nueva Empresa</Button>}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar empresa, descripción o sección…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(e => {
            const isOpen = expanded === e.id;
            return (
              <motion.div key={e.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="kpi-card overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : e.id)} className="w-full flex items-center gap-4 text-left cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"><Building2 className="w-5 h-5 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{e.nombre}</span>
                      <Badge variant="outline" className="text-[10px]">{e.seccion}</Badge>
                      <span className={`status-badge text-[10px] ${relacionColor(e.relacionUPV)}`}>{e.relacionUPV}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{e.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StarRating value={e.valoracion} />
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="pt-4 mt-4 border-t border-border space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <DetailField icon={Mail} label="Email" value={e.email} />
                          <DetailField icon={Phone} label="Teléfono" value={e.telefono} />
                          <DetailField icon={Globe} label="Web" value={e.web} isLink />
                          <DetailField icon={FileText} label="CIF/VAT" value={e.cif} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <DetailField label="Contacto" value={e.contacto} />
                          <DetailField label="Forma de pago" value={e.formaPago} />
                          <DetailField label="Facturar" value={e.facturar} />
                          <DetailField icon={Calendar} label="Fecha registro" value={e.fecha} />
                        </div>
                        <div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Descripción</p><p className="text-sm text-foreground">{e.descripcion}</p></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {e.observaciones && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Observaciones</p><p className="text-sm text-muted-foreground">{e.observaciones}</p></div>}
                          {e.documentacion && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Documentación</p><a href={e.documentacion} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">Ver documentos <ExternalLink className="w-3 h-3" /></a></div>}
                        </div>
                        {writable && (
                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" size="sm" onClick={() => openEdit(e)}><Pencil className="w-3 h-3 mr-1" />Editar</Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(e.id)}><Trash2 className="w-3 h-3 mr-1" />Eliminar</Button>
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
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No se encontraron empresas.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar empresa" : "Nueva empresa"}</DialogTitle>
            <DialogDescription>{editing ? "Modifica los campos necesarios" : "Rellena los datos de la nueva empresa"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => updateField("nombre", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Descripción</Label><Textarea value={form.descripcion} onChange={e => updateField("descripcion", e.target.value)} /></div>
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
              <div className="grid gap-2"><Label>CIF/VAT</Label><Input value={form.cif} onChange={e => updateField("cif", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Email</Label><Input value={form.email} onChange={e => updateField("email", e.target.value)} /></div>
              <div className="grid gap-2"><Label>Teléfono</Label><Input value={form.telefono} onChange={e => updateField("telefono", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Contacto</Label><Input value={form.contacto} onChange={e => updateField("contacto", e.target.value)} /></div>
              <div className="grid gap-2"><Label>Web</Label><Input value={form.web} onChange={e => updateField("web", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Relación UPV</Label>
                <Select value={form.relacionUPV} onValueChange={v => updateField("relacionUPV", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No alta – España">No alta – España</SelectItem>
                    <SelectItem value="No alta – Europa">No alta – Europa</SelectItem>
                    <SelectItem value="No alta – Extranjero">No alta – Extranjero</SelectItem>
                    <SelectItem value="Alta – España">Alta – España</SelectItem>
                    <SelectItem value="Alta – Europa">Alta – Europa</SelectItem>
                    <SelectItem value="Alta – Extranjero">Alta – Extranjero</SelectItem>
                    <SelectItem value="Acuerdo Marco">Acuerdo Marco</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Facturar</Label>
                <Select value={form.facturar} onValueChange={v => updateField("facturar", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Factura">Factura</SelectItem>
                    <SelectItem value="FACE">FACE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2"><Label>Forma de pago</Label><Input value={form.formaPago} onChange={e => updateField("formaPago", e.target.value)} /></div>
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
            <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
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

function DetailField({ icon: Icon, label, value, isLink }: { icon?: typeof Mail; label: string; value: string; isLink?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 flex items-center gap-1">{Icon && <Icon className="w-3 h-3" />} {label}</p>
      {isLink && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">{new URL(value).hostname} <ExternalLink className="w-3 h-3" /></a>
      ) : (
        <p className="text-sm text-foreground">{value || "—"}</p>
      )}
    </div>
  );
}
