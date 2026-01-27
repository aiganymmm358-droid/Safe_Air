import { Map, Trophy, Heart, Users, Swords, Zap, Home } from "lucide-react";
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

const mainItems = [
  { title: "Карта AQI", url: "/", icon: Map, emoji: "🗺️" },
  { title: "Мой прогресс", url: "/progress", icon: Trophy, emoji: "🏆" },
  { title: "Здоровье", url: "/health", icon: Heart, emoji: "💚" },
  { title: "Сообщество", url: "/community", icon: Users, emoji: "👥" },
  { title: "Битва районов", url: "/districts", icon: Swords, emoji: "⚔️" },
  { title: "Быстрые действия", url: "/actions", icon: Zap, emoji: "⚡" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">
            🌍
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display font-bold text-lg">SafeAir Pro</h1>
              <p className="text-xs text-muted-foreground">Чистый воздух Казахстана</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <span className="text-lg">{item.emoji}</span>
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
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Ваш вклад</p>
            <p className="font-display font-bold text-primary">127 кг CO₂</p>
            <p className="text-xs text-muted-foreground">предотвращено</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
