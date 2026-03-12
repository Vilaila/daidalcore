import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colaboradores } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import {
  Mail, Phone, FileText, ExternalLink, Calendar, ChevronDown, ChevronUp, Handshake
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/contexts/RoleContext";

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

export default function ColaboradoresPage() {
  const { canWrite } = useRole();
  const writable = canWrite("config");
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Colaboradores</h1>
          <p className="text-sm text-muted-foreground">Patrocinadores y colaboradores</p>
        </div>
        {writable && <Button size="sm">+ Nuevo</Button>}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {colaboradores.map(c => {
            const isOpen = expanded === c.id;
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="kpi-card overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="w-full flex items-center gap-4 text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Handshake className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{c.nombre}</span>
                      <span className={`status-badge text-[10px] ${tipoColor(c.tipo)}`}>{c.tipo}</span>
                      <span className={`status-badge text-[10px] ${estadoColor(c.estadoRelacion)}`}>{c.estadoRelacion}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.descripcion}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Details */}
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
                        {/* Contact */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <FieldItem icon={Mail} label="Correo" value={c.correo} />
                          <FieldItem icon={Phone} label="Teléfono" value={c.telefono} />
                          <FieldItem icon={Calendar} label="Inicio colaboración" value={c.fechaInicio} />
                        </div>

                        {/* Description */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Descripción</p>
                          <p className="text-sm text-foreground">{c.descripcion}</p>
                        </div>

                        {/* Condiciones */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Condiciones de la colaboración</p>
                          <p className="text-sm text-foreground">{c.condiciones || "—"}</p>
                        </div>

                        {/* Observaciones & Documentación */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Observaciones</p>
                            <p className="text-sm text-muted-foreground">{c.observaciones || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Documentación</p>
                            {c.documentacion ? (
                              <a href={c.documentacion} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                                Ver documentos <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <p className="text-sm text-muted-foreground">—</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FieldItem({ icon: Icon, label, value }: { icon?: typeof Mail; label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </p>
      <p className="text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}
