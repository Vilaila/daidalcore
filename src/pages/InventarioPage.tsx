import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { inventario } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, ChevronDown, ChevronUp, ExternalLink, Search } from "lucide-react";

export default function InventarioPage() {
  const { canWrite } = useRole();
  const writable = canWrite("inventario");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const estadoColor = (e: string) => {
    if (e === "Nuevo") return "bg-pastel-green text-secondary-foreground";
    if (e === "Funciona") return "bg-pastel-yellow";
    if (e === "Averiado") return "bg-pastel-orange";
    return "bg-pastel-red text-accent-foreground";
  };

  const filtered = inventario.filter((item) =>
    item.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
          <p className="text-sm text-muted-foreground">Artículos y material del equipo</p>
        </div>
        {writable && <Button size="sm">+ Nuevo Artículo</Button>}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar artículo por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No se encontraron artículos</p>
        )}
        <AnimatePresence>
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="kpi-card"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
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
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Photo */}
                      <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                        {item.foto ? (
                          <img src={item.foto} alt={item.nombre} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Camera className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-foreground">Descripción:</span> <span className="text-muted-foreground">{item.descripcion}</span></p>
                        <p><span className="font-medium text-foreground">Sección:</span> <span className="text-muted-foreground">{item.seccion}</span></p>
                        <p><span className="font-medium text-foreground">Unidades:</span> <span className="text-muted-foreground">{item.unidades}</span></p>
                        <p><span className="font-medium text-foreground">Ubicación:</span> <span className="text-muted-foreground">{item.ubicacion}</span></p>
                        <p><span className="font-medium text-foreground">Responsable:</span> <span className="text-muted-foreground">{item.responsable}</span></p>
                      </div>

                      {/* More info */}
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-foreground">Estado:</span> <span className={`status-badge ${estadoColor(item.estado)}`}>{item.estado}</span></p>
                        <p><span className="font-medium text-foreground">Fecha:</span> <span className="text-muted-foreground">{item.fecha}</span></p>
                        {item.enlaceWeb && (
                          <p>
                            <span className="font-medium text-foreground">Enlace web:</span>{" "}
                            <a href={item.enlaceWeb} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                              Ver en web <ExternalLink className="w-3 h-3" />
                            </a>
                          </p>
                        )}
                        {item.observaciones && (
                          <div>
                            <p className="font-medium text-foreground">Observaciones:</p>
                            <p className="text-muted-foreground">{item.observaciones}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
