import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role = "presidente" | "gestor_economico" | "coordinador_seccion" | "coordinador_proyecto" | "miembro";

export const ROLE_LABELS: Record<Role, string> = {
  presidente: "Presidente",
  gestor_economico: "Gestor Económico",
  coordinador_seccion: "Coordinador de Sección",
  coordinador_proyecto: "Coordinador de Proyecto",
  miembro: "Miembro",
};

export type Permission = "read" | "write" | "admin";

const ROLE_PERMISSIONS: Record<Role, Record<string, Permission>> = {
  presidente: {
    dashboard: "admin",
    presupuestos: "admin",
    eventos: "admin",
    pedidos: "admin",
    inventario: "admin",
    config: "admin",
  },
  gestor_economico: {
    dashboard: "read",
    presupuestos: "write",
    eventos: "write",
    pedidos: "write",
    inventario: "write",
    config: "write",
  },
  coordinador_seccion: {
    dashboard: "read",
    presupuestos: "write",
    eventos: "read",
    pedidos: "read",
    inventario: "write",
    config: "read",
  },
  coordinador_proyecto: {
    dashboard: "read",
    presupuestos: "read",
    eventos: "read",
    pedidos: "read",
    inventario: "read",
    config: "read",
  },
  miembro: {
    dashboard: "read",
    presupuestos: "read",
    eventos: "read",
    pedidos: "read",
    inventario: "read",
    config: "read",
  },
};

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  hasPermission: (module: string, level: Permission) => boolean;
  canWrite: (module: string) => boolean;
  isAdmin: () => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>("presidente");

  const hasPermission = (module: string, level: Permission): boolean => {
    const perms = ROLE_PERMISSIONS[role];
    const perm = perms[module] || "read";
    if (level === "read") return true;
    if (level === "write") return perm === "write" || perm === "admin";
    if (level === "admin") return perm === "admin";
    return false;
  };

  const canWrite = (module: string) => hasPermission(module, "write");
  const isAdmin = () => role === "presidente";

  return (
    <RoleContext.Provider value={{ role, setRole, hasPermission, canWrite, isAdmin }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
};
