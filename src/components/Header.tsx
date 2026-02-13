import { Bell, Settings, User, Menu, Wind } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Wind className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl gradient-text">SafeAir Pro</h1>
              <p className="text-xs text-muted-foreground">Дыши свободно</p>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Карта</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Сообщество</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Обучение</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Магазин</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg hover:bg-muted transition-colors hidden sm:block">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  АК
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">Алия</p>
                <p className="text-xs text-muted-foreground">Lv.15</p>
              </div>
            </div>

            {/* Mobile menu */}
            <button className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
