import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { miembros } from "@/data/mockData";
import type { RolMiembro } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Phone, Mail, Calendar, ChevronDown, ChevronUp, User, Shield, GraduationCap, IdCard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/contexts/RoleContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

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

export default function MiembrosPage() {
  const { canWrite, role } = useRole();
  const writable = canWrite("config");
  const canFilter = role === "presidente" || role === "coordinador_seccion";

  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState<string>("all");
  const [filterTitulacion, setFilterTitulacion] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const titulaciones = [...new Set(miembros.map(m => m.titulacion))];

  const filtered = miembros.filter(m => {
    const matchSearch =
      `${m.nombre} ${m.apellidos}`.toLowerCase().includes(search.toLowerCase()) ||
      m.seccion.toLowerCase().includes(search.toLowerCase());
    const matchRol = filterRol === "all" || m.rol === filterRol;
    const matchTit = filterTitulacion === "all" || m.titulacion === filterTitulacion;
    return matchSearch && matchRol && matchTit;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Miembros</h1>
          <p className="text-sm text-muted-foreground">Equipo de Daidalonic UPV</p>
        </div>
        {writable && <Button size="sm">+ Nuevo Miembro</Button>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o sección…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {canFilter && (
          <>
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="Presidente">Presidente</SelectItem>
                <SelectItem value="Coordinador de Sección">Coord. Sección</SelectItem>
                <SelectItem value="Coordinador de Proyecto">Coord. Proyecto</SelectItem>
                <SelectItem value="Miembro">Miembro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTitulacion} onValueChange={setFilterTitulacion}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por titulación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las titulaciones</SelectItem>
                {titulaciones.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Members list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(m => {
            const isOpen = expanded === m.id;
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="kpi-card overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : m.id)}
                  className="w-full flex items-center gap-4 text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{m.nombre} {m.apellidos}</span>
                      <span className={`status-badge text-[10px] ${rolColor(m.rol)}`}>{m.rol}</span>
                      <span className={`status-badge text-[10px] ${estatusColor(m.estatus)}`}>{m.estatus}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.seccion} · {m.titulacion} · {m.centro}</p>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <FieldItem icon={Phone} label="Teléfono" value={m.telefono} />
                          <FieldItem icon={Mail} label="Correo UPV" value={m.correoUPV} />
                          <FieldItem icon={Mail} label="Correo personal" value={m.correoPersonal} />
                          <FieldItem icon={Calendar} label="Cumpleaños" value={m.cumpleanos} />
                        </div>

                        {/* Academic */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <FieldItem icon={GraduationCap} label="Titulación" value={m.titulacion} />
                          <FieldItem label="Centro" value={m.centro} />
                          <FieldItem label="Año universitario" value={`${m.anioUniversitario}º`} />
                          <FieldItem icon={Shield} label="Sección" value={m.seccion} />
                        </div>

                        {/* Identification */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <FieldItem icon={IdCard} label={m.tipoIdentificacion} value={m.numeroIdentificacion} />
                          <FieldItem icon={Calendar} label="Fecha entrada" value={m.fechaEntrada} />
                          <FieldItem icon={Calendar} label="Fecha salida" value={m.fechaSalida || "—"} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No se encontraron miembros.</p>
        )}
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
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
