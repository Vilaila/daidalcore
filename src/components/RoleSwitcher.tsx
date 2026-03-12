import { motion } from "framer-motion";
import { useRole, Role, ROLE_LABELS } from "@/contexts/RoleContext";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export const RoleSwitcher = () => {
  const { role, setRole } = useRole();
  const [open, setOpen] = useState(false);

  const roles: Role[] = ["presidente", "gestor_economico", "coordinador_seccion", "coordinador_proyecto", "miembro"];

  return (
    <div className="fab-role-switcher">
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-16 right-0 bg-card border border-border rounded-xl p-2 min-w-[220px]"
          style={{ boxShadow: "var(--shadow-elevated)" }}
        >
          <p className="text-xs font-semibold text-muted-foreground px-3 py-1.5 uppercase tracking-wider">Cambiar Vista</p>
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                role === r ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"
              }`}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </motion.div>
      )}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full font-medium text-sm"
      >
        <RefreshCw className="w-4 h-4" />
        {ROLE_LABELS[role]}
      </motion.button>
    </div>
  );
};
