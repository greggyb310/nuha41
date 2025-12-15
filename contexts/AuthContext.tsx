import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { authService } from '../services/auth';
import type { UserProfile } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInAsGuest: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<{ error: Error | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data, error } = await authService.getUserProfile(userId);
    if (!error && data) {
      setProfile(data);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        loadProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user?.id) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await authService.signUp(email, password);

      if (response.error) {
        return { error: response.error };
      }

      if (response.user && fullName) {
        const { error: profileError } = await authService.createUserProfile(
          response.user.id,
          { full_name: fullName }
        );

        if (profileError) {
          console.error('Failed to create profile:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await authService.signIn(email, password);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInAsGuest = async () => {
    try {
      const { error } = await authService.signInAsGuest();
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await authService.signOut();
      if (!error) {
        setProfile(null);
      }
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authService.resetPassword(email);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { data, error } = await authService.updateUserProfile(user.id, updates);

      if (!error && data) {
        setProfile(data);
      }

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshSession = async () => {
    try {
      console.log('[AuthContext] Manually refreshing session...');
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('[AuthContext] Failed to refresh session:', error);
        return { error };
      }

      console.log('[AuthContext] Session refreshed successfully');
      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user?.id) {
        await loadProfile(data.session.user.id);
      }

      return { error: null };
    } catch (error) {
      console.error('[AuthContext] Exception during refresh:', error);
      return { error: error as Error };
    }
  };

  const hasCompletedProfile = !!profile;

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    hasCompletedProfile,
    signUp,
    signIn,
    signInAsGuest,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
