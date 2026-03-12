import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { empresas } from "@/data/mockData";
import type { Empresa } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Star, Search, Globe, Phone, Mail, FileText, ExternalLink,
  ChevronDown, ChevronUp, Building2, Calendar, Pencil, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/contexts/RoleContext";

function StarRating({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-xs text-muted-foreground italic">Aún no</span>;
  }
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= value ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function relacionColor(r: string) {
  if (r.startsWith("Alta")) return "bg-[hsl(145,50%,88%)] text-[hsl(145,40%,25%)]";
  if (r === "Acuerdo Marco") return "bg-[hsl(220,60%,90%)] text-[hsl(220,50%,30%)]";
  return "bg-muted text-muted-foreground";
}

export default function EmpresasPage() {
  const { canWrite } = useRole();
  const writable = canWrite("config");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = empresas.filter(e =>
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    e.descripcion.toLowerCase().includes(search.toLowerCase()) ||
    e.seccion.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empresas</h1>
          <p className="text-sm text-muted-foreground">Directorio de proveedores</p>
        </div>
        {writable && <Button size="sm">+ Nueva Empresa</Button>}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar empresa, descripción o sección…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(e => {
            const isOpen = expanded === e.id;
            return (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="kpi-card overflow-hidden"
              >
                {/* Header row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : e.id)}
                  className="w-full flex items-center gap-4 text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  </div>
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

                {/* Expanded details */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-border space-y-4">
                        {/* Contact info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <DetailField icon={Mail} label="Email" value={e.email} />
                          <DetailField icon={Phone} label="Teléfono" value={e.telefono} />
                          <DetailField icon={Globe} label="Web" value={e.web} isLink />
                          <DetailField icon={FileText} label="CIF/VAT" value={e.cif} />
                        </div>

                        {/* More details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <DetailField label="Contacto" value={e.contacto} />
                          <DetailField label="Forma de pago" value={e.formaPago} />
                          <DetailField label="Facturar" value={e.facturar} />
                          <DetailField icon={Calendar} label="Fecha registro" value={e.fecha} />
                        </div>

                        {/* Descripción */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Descripción</p>
                          <p className="text-sm text-foreground">{e.descripcion}</p>
                        </div>

                        {/* Observaciones & Documentación */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {e.observaciones && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Observaciones</p>
                              <p className="text-sm text-muted-foreground">{e.observaciones}</p>
                            </div>
                          )}
                          {e.documentacion && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Documentación</p>
                              <a href={e.documentacion} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                                Ver documentos <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                        {writable && (
                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" size="sm">
                              <Pencil className="w-3 h-3 mr-1" />Editar
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-3 h-3 mr-1" />Eliminar
                            </Button>
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
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No se encontraron empresas.</p>
        )}
      </div>
    </motion.div>
  );
}

function DetailField({ icon: Icon, label, value, isLink }: {
  icon?: typeof Mail; label: string; value: string; isLink?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </p>
      {isLink && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
          {new URL(value).hostname} <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <p className="text-sm text-foreground">{value || "—"}</p>
      )}
    </div>
  );
}
