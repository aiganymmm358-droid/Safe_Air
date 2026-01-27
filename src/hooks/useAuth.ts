import { useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info: string | null;
  ip_address: string | null;
  created_at: string;
  last_active_at: string;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: UserRole[];
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    roles: [],
    isLoading: true,
    error: null,
  });

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile | null;
  }, []);

  // Fetch user roles
  const fetchRoles = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
    return data as UserRole[];
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isLoading: false,
        }));

        // Defer profile/roles fetch with setTimeout
        if (session?.user) {
          setTimeout(async () => {
            const [profile, roles] = await Promise.all([
              fetchProfile(session.user.id),
              fetchRoles(session.user.id),
            ]);
            setState(prev => ({ ...prev, profile, roles }));
          }, 0);
        } else {
          setState(prev => ({ ...prev, profile: null, roles: [] }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }));

      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchRoles(session.user.id),
        ]).then(([profile, roles]) => {
          setState(prev => ({ ...prev, profile, roles }));
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchRoles]);

  // Sign up with email/password
  const signUp = async (email: string, password: string, fullName?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
        },
      },
    });

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    setState(prev => ({ ...prev, isLoading: false }));
    return { data, error: null };
  };

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    // Track session
    if (data.session) {
      await trackSession(data.session);
    }

    setState(prev => ({ ...prev, isLoading: false }));
    return { data, error: null };
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    return { data, error: null };
  };

  // Track session for device management
  const trackSession = async (session: Session) => {
    try {
      const deviceInfo = `${navigator.userAgent}`;
      
      await supabase.from('user_sessions').insert({
        user_id: session.user.id,
        session_token: session.access_token.substring(0, 50), // Store partial token for identification
        device_info: deviceInfo,
        ip_address: null, // Would need server-side to get real IP
      });
    } catch (error) {
      console.error('Error tracking session:', error);
    }
  };

  // Sign out
  const signOut = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    setState(prev => ({
      ...prev,
      user: null,
      session: null,
      profile: null,
      roles: [],
      isLoading: false,
    }));

    return { error: null };
  };

  // Sign out from all devices
  const signOutAllDevices = async () => {
    if (!state.user) return { error: new Error('Not authenticated') };

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Invalidate all sessions in database
      const { error: rpcError } = await supabase.rpc('invalidate_all_sessions', {
        _user_id: state.user.id,
      });

      if (rpcError) throw rpcError;

      // Sign out globally from Supabase Auth
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });

      if (signOutError) throw signOutError;

      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        profile: null,
        roles: [],
        isLoading: false,
      }));

      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign out from all devices';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return { error };
    }
  };

  // Get active sessions
  const getActiveSessions = async (): Promise<UserSession[]> => {
    if (!state.user) return [];

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', state.user.id)
      .eq('is_active', true)
      .order('last_active_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }

    return data as UserSession[];
  };

  // Update profile
  const updateProfile = async (updates: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>) => {
    if (!state.user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', state.user.id)
      .select()
      .single();

    if (error) {
      return { error };
    }

    setState(prev => ({ ...prev, profile: data as Profile }));
    return { data, error: null };
  };

  // Check if user has a specific role
  const hasRole = (role: 'admin' | 'moderator' | 'user'): boolean => {
    return state.roles.some(r => r.role === role);
  };

  return {
    ...state,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    signOutAllDevices,
    getActiveSessions,
    updateProfile,
    hasRole,
    isAuthenticated: !!state.user,
  };
}
