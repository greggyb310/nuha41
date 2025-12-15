import { supabase } from './supabase';
import { databaseService } from './database';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { UserProfile } from '../types/database';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface ProfileResponse {
  data: UserProfile | null;
  error: Error | null;
}

export const authService = {
  async signUp(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return {
      user: data.user,
      session: data.session,
      error
    };
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return {
      user: data.user,
      session: data.session,
      error
    };
  },

  async signInAsGuest(): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInAnonymously();
    return {
      user: data.user,
      session: data.session,
      error
    };
  },

  async signUpWithUsername(username: string): Promise<AuthResponse> {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/username-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ action: 'signup', username }),
        }
      );

      const data = await response.json() as any;

      if (!response.ok) {
        return {
          user: null,
          session: null,
          error: { message: data.error || 'Failed to create account', name: 'AuthError', status: response.status } as any
        };
      }

      if (data.session) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          return {
            user: null,
            session: null,
            error: sessionError
          };
        }

        return {
          user: sessionData.user,
          session: sessionData.session,
          error: null
        };
      }

      return {
        user: data.user,
        session: null,
        error: null
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: { message: 'Network error', name: 'NetworkError', status: 0 } as any
      };
    }
  },

  async signInWithUsername(username: string): Promise<AuthResponse> {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/username-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ action: 'login', username }),
        }
      );

      const data = await response.json() as any;

      if (!response.ok) {
        return {
          user: null,
          session: null,
          error: { message: data.error || 'Failed to sign in', name: 'AuthError', status: response.status } as any
        };
      }

      if (data.session) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          return {
            user: null,
            session: null,
            error: sessionError
          };
        }

        return {
          user: sessionData.user,
          session: sessionData.session,
          error: null
        };
      }

      return {
        user: data.user,
        session: null,
        error: null
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: { message: 'Network error', name: 'NetworkError', status: 0 } as any
      };
    }
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },

  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  },

  async updateEmail(newEmail: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    return { error };
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        callback(event, session);
      })();
    });
    return data.subscription;
  },

  async getUserProfile(userId: string): Promise<ProfileResponse> {
    try {
      const { data, error } = await databaseService.getUserProfile(userId);
      return {
        data,
        error: error ? new Error(error.message) : null,
      };
    } catch (err) {
      return {
        data: null,
        error: err as Error,
      };
    }
  },

  async createUserProfile(userId: string, profile: Partial<UserProfile>): Promise<ProfileResponse> {
    try {
      const { data, error } = await databaseService.createUserProfile({
        user_id: userId,
        username: profile.username || null,
        full_name: profile.full_name || null,
        health_goals: profile.health_goals || [],
        preferences: profile.preferences || {},
      });
      return {
        data,
        error: error ? new Error(error.message) : null,
      };
    } catch (err) {
      return {
        data: null,
        error: err as Error,
      };
    }
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<ProfileResponse> {
    try {
      const { data, error } = await databaseService.updateUserProfile(userId, updates);
      return {
        data,
        error: error ? new Error(error.message) : null,
      };
    } catch (err) {
      return {
        data: null,
        error: err as Error,
      };
    }
  },
};
