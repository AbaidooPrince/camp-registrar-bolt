import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user || null);

      if (user) {
        const { data } = await supabase
          .from('admin_profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();

        setIsAdmin(data?.is_admin || false);
      }
      setIsLoading(false);
    };

    checkAuth();

    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setUser(session?.user || null);

        if (session?.user) {
          const { data } = await supabase
            .from('admin_profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .maybeSingle();

          setIsAdmin(data?.is_admin || false);
        } else {
          setIsAdmin(false);
        }
      })();
    });
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert([{
          id: data.user.id,
          email,
          full_name: fullName,
          is_admin: true,
        }]);

      if (profileError) throw profileError;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
