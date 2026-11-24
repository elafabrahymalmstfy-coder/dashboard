import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const DEMO_STORAGE_KEY = 'metricgrid_demo_role';

// Demo credentials — ONLY valid when Supabase env vars are NOT configured (local preview)
export const DEMO_ACCOUNTS = [
  { email: 'admin@metricgrid.io', password: 'Admin@123', role: 'admin' },
  { email: 'viewer@metricgrid.io', password: 'Viewer@123', role: 'viewer' },
];

const AuthContext = createContext({
  user: null,
  profile: null,
  role: 'viewer',
  isAdmin: false,
  loading: true,
  authError: null,
  isDemoMode: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  enterDemoSession: () => {},
});

function createDemoUser(selectedRole) {
  const isAdminRole = selectedRole === 'admin';
  return {
    user: {
      id: isAdminRole ? 'demo-admin-001' : 'demo-viewer-002',
      email: isAdminRole ? 'admin@metricgrid.io' : 'viewer@metricgrid.io',
    },
    profile: {
      id: isAdminRole ? 'demo-admin-001' : 'demo-viewer-002',
      email: isAdminRole ? 'admin@metricgrid.io' : 'viewer@metricgrid.io',
      full_name: isAdminRole ? 'Alex Rivera (Admin)' : 'Jordan Lee (Viewer)',
      role: isAdminRole ? 'admin' : 'viewer',
    },
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchUserProfile = useCallback(async (authUser) => {
    if (!supabase || !authUser) {
      setProfile(null);
      setRole('viewer');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', authUser.id)
        .single();

      if (error) {
        // Fallback to least-privilege viewer if profile row is missing or blocked
        setProfile({
          id: authUser.id,
          email: authUser.email ?? '',
          full_name: authUser.email?.split('@')[0] ?? 'User',
          role: 'viewer',
        });
        setRole('viewer');
        return;
      }

      const normalizedRole = data?.role === 'admin' ? 'admin' : 'viewer';
      setProfile(data);
      setRole(normalizedRole);
    } catch {
      setRole('viewer');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // If Supabase env vars are not configured, check if user activated Preview Mode
      if (!isSupabaseConfigured || !supabase) {
        try {
          const savedDemoRole = sessionStorage.getItem(DEMO_STORAGE_KEY);
          if (savedDemoRole === 'admin' || savedDemoRole === 'viewer') {
            const demo = createDemoUser(savedDemoRole);
            if (isMounted) {
              setUser(demo.user);
              setProfile(demo.profile);
              setRole(demo.profile.role);
              setIsDemoMode(true);
            }
          }
        } catch {
          // Ignore storage errors
        } finally {
          if (isMounted) setLoading(false);
        }
        return;
      }

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          if (isMounted) setAuthError(error.message);
        }

        const currentUser = session?.user ?? null;
        if (isMounted) {
          setUser(currentUser);
        }

        if (currentUser) {
          await fetchUserProfile(currentUser);
        }
      } catch (err) {
        if (isMounted) {
          setAuthError(err instanceof Error ? err.message : 'Failed to verify session.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        isMounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      if (!isMounted) return;

      setUser(nextUser);
      if (nextUser) {
        setLoading(true);
        await fetchUserProfile(nextUser);
        if (isMounted) setLoading(false);
      } else {
        setProfile(null);
        setRole('viewer');
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const enterDemoSession = (selectedRole = 'viewer') => {
    if (isSupabaseConfigured) return; // Disabled whenever real Supabase is configured
    const safeRole = selectedRole === 'admin' ? 'admin' : 'viewer';
    const demo = createDemoUser(safeRole);
    try {
      sessionStorage.setItem(DEMO_STORAGE_KEY, safeRole);
    } catch {
      // Ignore storage errors
    }
    setUser(demo.user);
    setProfile(demo.profile);
    setRole(safeRole);
    setIsDemoMode(true);
    setAuthError(null);
    setLoading(false);
  };

  const signIn = async ({ email, password }) => {
    setAuthError(null);

    if (!isSupabaseConfigured || !supabase) {
      const match = DEMO_ACCOUNTS.find(
        (acc) =>
          acc.email.toLowerCase() === email.trim().toLowerCase() &&
          acc.password === password
      );

      if (match) {
        enterDemoSession(match.role);
        return { data: { role: match.role }, error: null };
      }

      return {
        error: {
          code: 'demoInvalid',
          message:
            'Invalid credentials. Use the demo accounts listed below, or configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for live auth.',
        },
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setAuthError(error.message);
      return { data: null, error };
    }

    if (data?.user) {
      setUser(data.user);
      await fetchUserProfile(data.user);
    }

    return { data, error: null };
  };

  const signOut = async () => {
    setAuthError(null);
    if (isDemoMode || !isSupabaseConfigured || !supabase) {
      try {
        sessionStorage.removeItem(DEMO_STORAGE_KEY);
      } catch {
        // Ignore
      }
      setUser(null);
      setProfile(null);
      setRole('viewer');
      setIsDemoMode(false);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRole('viewer');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin: role === 'admin',
        loading,
        authError,
        isDemoMode,
        signIn,
        signOut,
        enterDemoSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
