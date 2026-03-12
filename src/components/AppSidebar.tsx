import {
  LayoutDashboard,
  Receipt,
  Calendar,
  ShoppingCart,
  Package,
  Building2,
  Users,
  UserCircle,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRole, ROLE_LABELS } from "@/contexts/RoleContext";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Presupuestos", url: "/presupuestos", icon: Receipt },
  { title: "Eventos Económicos", url: "/eventos", icon: Calendar },
  { title: "Pedidos", url: "/pedidos", icon: ShoppingCart },
  { title: "Inventario", url: "/inventario", icon: Package },
];

const configItems = [
  { title: "Empresas", url: "/config/empresas", icon: Building2 },
  { title: "Colaboradores", url: "/config/colaboradores", icon: Users },
  { title: "Miembros", url: "/config/miembros", icon: UserCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { role } = useRole();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-primary-foreground text-sm"
              style={{ background: "var(--gradient-brand)" }}>
              D
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-none">Daidalonic</h2>
              <p className="text-xs text-muted-foreground">ERP · UPV</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-primary-foreground text-sm mx-auto"
            style={{ background: "var(--gradient-brand)" }}>
            D
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/"} className="hover:bg-muted/50" activeClassName="bg-pastel-yellow text-foreground font-semibold">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className="hover:bg-muted/50" activeClassName="bg-pastel-yellow text-foreground font-semibold">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <Settings className="inline w-3 h-3 mr-1" />
            {ROLE_LABELS[role]}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
