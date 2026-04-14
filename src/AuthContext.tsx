// Campus Pace - Ultimate Force Update - 2026-04-11
// Campus Pace - Global Synchronization & Stabilization Update - 2026-04-11
// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './types';
import { supabase } from './lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
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
        let { data: fetchUserData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // FALLBACK to 'profiles' table if 'users' fails
        if (dbError || !fetchUserData) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profileData && !profileError) {
            fetchUserData = profileData;
            dbError = null;
          }
        }

        let userData = fetchUserData;
        const pendingRole = localStorage.getItem('pending_role');

        // Handle OAuth First-Time Sign IN (No Row Exists)
        if (dbError && (dbError.code === 'PGRST116' || dbError.message?.includes('does not exist'))) {
          const newRole = pendingRole || session.user.user_metadata?.role || 'student';
          const newProfile = {
             id: session.user.id,
             name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
             email: session.user.email || '',
             role: newRole,
             department: '',
             eco_stats: {
                total_pages_saved: 0,
                total_water_saved: 0,
                total_co2_prevented: 0,
                total_trees_preserved: 0
             }
          };

          // Try inserting into 'users' first
          let { data: insertedData, error: insertError } = await supabase
             .from('users')
             .insert([newProfile])
             .select()
             .single();
          
          // If 'users' insert fails (e.g. table missing), try 'profiles'
          if (insertError) {
            const { data: profileInsert, error: pInsertError } = await supabase
              .from('profiles')
              .insert([newProfile])
              .select()
              .single();
            if (!pInsertError) {
              insertedData = profileInsert;
              insertError = null;
            }
          }

          if (!insertError) {
            userData = insertedData;
          } else {
            console.error("Failed to create user profile in any table:", insertError);
            userData = newProfile; // Fallback to local metadata
          }
        }

        if (!mounted) return;

        const roleFromTable = userData?.role;
        const roleFromMetadata = session.user.user_metadata?.role;
        
        // We prioritize the role you JUST clicked on the login screen!
        const finalRole = (pendingRole || roleFromTable || roleFromMetadata || 'student').toLowerCase();

        // Update the database if the role needs changing
        if (userData && pendingRole && pendingRole !== userData.role && (!dbError || dbError.code !== 'PGRST116')) {
           const targetTable = (dbError === null && fetchUserData) ? 'users' : 'profiles'; 
           await supabase
            .from(targetTable)
            .update({ role: pendingRole })
            .eq('id', session.user.id);
        }

        const freshUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: userData?.name || userData?.full_name || session.user.user_metadata?.full_name || 'User',
          role: finalRole as any,
          department: userData?.department || session.user.user_metadata?.department || '',
          eco_stats: userData?.eco_stats || {
            total_pages_saved: 0,
            total_water_saved: 0,
            total_co2_prevented: 0,
            total_trees_preserved: 0
          },
          eco_level: userData?.eco_level || 1,
          avatar: userData?.avatar || session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
        };

        // HYBRID SYNC: If we have an email, double check the local backend for the latest stats
        if (freshUser.email) {
          try {
            // Using a relative path and encoding the email for maximum reliability
            // Add a timeout to prevent hanging the whole login process if backend is slow/stuck
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
            
            const statsRes = await fetch(`/api/auth/stats/${encodeURIComponent(freshUser.email)}`, {
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (statsRes.ok) {
              const { eco_stats } = await statsRes.json();
              if (eco_stats) {
                // Ensure we merge with local backend data as the definitive source for stats
                freshUser.eco_stats = {
                  total_pages_saved: Math.max(freshUser.eco_stats?.total_pages_saved || 0, eco_stats.total_pages_saved || 0),
                  total_water_saved: Math.max(freshUser.eco_stats?.total_water_saved || 0, eco_stats.total_water_saved || 0),
                  total_co2_prevented: Math.max(freshUser.eco_stats?.total_co2_prevented || 0, eco_stats.total_co2_prevented || 0),
                  total_trees_preserved: Math.max(freshUser.eco_stats?.total_trees_preserved || 0, eco_stats.total_trees_preserved || 0),
                };
              }
            }
          } catch (backendErr) {
            console.warn("Backend Stats Bridge unavailable or timed out, falling back to Supabase only.");
          }
        }

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
            role: (localStorage.getItem('pending_role') || session.user.user_metadata?.role || 'student').toLowerCase() as any,
            name: session.user.user_metadata?.full_name || 'User',
            department: ''
          };
          setUser(minimalUser);
          localStorage.setItem('gs_user', JSON.stringify(minimalUser));
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
    setUser(null);
    localStorage.removeItem('gs_user');
    localStorage.removeItem('token');
    localStorage.removeItem('pending_role');
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Background signout failed:", error);
    }
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userData || session.user.email) {
        let finalStats = userData?.eco_stats || user?.eco_stats;

        // HYBRID REFRESH: Fetch from MongoDB as the primary source for stats
        if (session.user.email) {
          try {
            // Using a relative path and encoding the email for maximum reliability
            const statsRes = await fetch(`/api/auth/stats/${encodeURIComponent(session.user.email)}`);
            if (statsRes.ok) {
              const { eco_stats } = await statsRes.json();
              if (eco_stats) {
                finalStats = {
                  total_pages_saved: Math.max(finalStats?.total_pages_saved || 0, eco_stats.total_pages_saved || 0),
                  total_water_saved: Math.max(finalStats?.total_water_saved || 0, eco_stats.total_water_saved || 0),
                  total_co2_prevented: Math.max(finalStats?.total_co2_prevented || 0, eco_stats.total_co2_prevented || 0),
                  total_trees_preserved: Math.max(finalStats?.total_trees_preserved || 0, eco_stats.total_trees_preserved || 0),
                };
              }
            }
          } catch (err) {
            console.warn("Manual backend sync failed, using best available data.");
          }
        }

        const updatedUser: User = {
          ...user!,
          name: userData?.name || user?.name || session.user.user_metadata?.full_name || 'User',
          role: userData?.role || user?.role || 'student',
          eco_stats: finalStats,
          eco_level: userData?.eco_level || user?.eco_level || 1,
          avatar: userData?.avatar || user?.avatar
        };
        setUser(updatedUser);
        localStorage.setItem('gs_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Refresh User Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
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
