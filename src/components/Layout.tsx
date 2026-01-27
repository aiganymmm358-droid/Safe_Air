import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserMenu } from "@/components/UserMenu";
import { LocationWidget } from "@/components/LocationWidget";
import { Outlet } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";

export function Layout() {
  const { profile, isAuthenticated } = useAuthContext();

  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    return 'Гость';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-muted via-background to-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Top Header */}
          <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted rounded-lg p-2" />
              <div className="hidden md:block">
                <p className="text-sm text-muted-foreground">Добро пожаловать,</p>
                <p className="font-semibold">{getDisplayName()} {isAuthenticated ? '👋' : ''}</p>
              </div>
              {/* Location and Weather Widget */}
              <div className="hidden lg:block">
                <LocationWidget />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Location Widget */}
              <div className="lg:hidden">
                <LocationWidget />
              </div>
              <button className="p-2 hover:bg-muted rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <UserMenu />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
