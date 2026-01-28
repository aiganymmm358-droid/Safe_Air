import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Shield, Monitor, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export function UserMenu() {
  const navigate = useNavigate();
  const { user, profile, roles, signOut, signOutAllDevices, isAuthenticated, isLoading } = useAuthContext();
  const { t } = useLanguage();
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="w-5 h-5 animate-spin" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button variant="outline" onClick={() => navigate('/auth')}>
        {t.auth.login}
      </Button>
    );
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getPrimaryRole = () => {
    if (roles.some(r => r.role === 'admin')) return t.common.administrator;
    if (roles.some(r => r.role === 'moderator')) return t.common.moderator;
    return t.common.user;
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const result = await signOut();
    
    if (result.error) {
      toast.error(t.toast.signOutError);
    } else {
      toast.success(t.toast.signOutSuccess);
      navigate('/auth');
    }
    setIsSigningOut(false);
  };

  const handleSignOutAllDevices = async () => {
    setIsSigningOut(true);
    const result = await signOutAllDevices();
    
    if (result.error) {
      toast.error(t.toast.signOutError);
    } else {
      toast.success(t.toast.signOutSuccess);
      navigate('/auth');
    }
    setIsSigningOut(false);
    setShowLogoutAllDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-muted/50 hover:bg-muted transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-none">
                {profile?.full_name || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground">{getPrimaryRole()}</p>
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{profile?.full_name || t.common.user}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="w-4 h-4 mr-2" />
            {t.auth.profile}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            {t.header.settings}
          </DropdownMenuItem>

          {roles.some(r => r.role === 'admin') && (
            <DropdownMenuItem onClick={() => navigate('/admin')}>
              <Shield className="w-4 h-4 mr-2" />
              Админ-панель
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowLogoutAllDialog(true)}
            className="text-amber-600"
          >
            <Monitor className="w-4 h-4 mr-2" />
            {t.auth.logoutAll}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-destructive"
          >
            {isSigningOut ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            {t.auth.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.auth.logoutAllConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.auth.logoutAllDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSigningOut}>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOutAllDevices}
              disabled={isSigningOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.common.loading}
                </>
              ) : (
                t.auth.logoutAll
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
