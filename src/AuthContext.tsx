import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './types';
import { supabase } from './lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use local storage as initial state, but we'll re-verify shortly
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('gs_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Start with loading true if we don't have a local session to show
  const [isLoading, setIsLoading] = useState(!localStorage.getItem('gs_user'));

  useEffect(() => {
    let mounted = true;

    // Listen for Supabase Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
          // Clear storage on clean logout or session loss
          localStorage.removeItem('gs_user');
        }
        return;
      }

      // If it's a silent refresh and we already have a user, just stop loading
      if ((event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && user) {
        if (mounted) setIsLoading(false);
        return;
      }

      // For initial sessions or sign-ins, we always want to verify/update the profile
      try {
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!mounted) return;

        // Determine the role: Selected Role (pending) > Table Data > Metadata > Default
        const pendingRole = localStorage.getItem('pending_role');
        const roleFromTable = userData?.role;
        const roleFromMetadata = session.user.user_metadata?.role;
        
        // We prioritize the role you JUST clicked on the login screen!
        const finalRole = pendingRole || roleFromTable || roleFromMetadata || 'student';

        // If your selected role is different from what we have in the database, update the database!
        if (userData && pendingRole && pendingRole !== userData.role) {
          await supabase
            .from('users')
            .update({ role: pendingRole })
            .eq('id', session.user.id);
        }

        const freshUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: userData?.name || session.user.user_metadata?.full_name || 'User',
          role: finalRole as any,
          department: userData?.department || '',
          avatar: userData?.avatar || session.user.user_metadata?.avatar_url
        };

        setUser(freshUser);
        localStorage.setItem('gs_user', JSON.stringify(freshUser));
        
        // Cleanup pending role once we've applied it
        if (pendingRole) localStorage.removeItem('pending_role');

      } catch (error) {
        console.error("Critical Profile Sync Error:", error);
        // Fallback to minimal session if DB is down but auth is up
        if (mounted && !user) {
          const minimalUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: (localStorage.getItem('pending_role') || 'student') as any,
            name: session.user.user_metadata?.full_name || 'User',
            department: ''
          };
          setUser(minimalUser);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('gs_user', JSON.stringify(userData));
  };

  const logout = async () => {
    // 1. Instant UI Cleanup
    setUser(null);
    localStorage.removeItem('gs_user');
    localStorage.removeItem('token');
    localStorage.removeItem('pending_role');
    
    // 2. Background Server Cleanup
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Background signout failed (already cleared locally):", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
