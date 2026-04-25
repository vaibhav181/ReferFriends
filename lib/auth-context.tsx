'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  company: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load session on mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

    return () => subscription?.unsubscribe();
  }, []);

  // ✅ FIXED SIGNUP (metadata stored correctly)
  const signUp = async ({ email, password, fullName, company }: SignUpPayload) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,        // 👈 used for display
            company: company,      // 👈 stored for later use
          },
        },
      });

      if (error) throw error;

    } finally {
      setLoading(false);
    }
  };

  // ✅ SIGN IN
  const signIn = async (email: string, password: string) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

    } finally {
      setLoading(false);
    }
  };

  // ✅ SIGN OUT
  const signOut = async () => {
    setLoading(true);

    try {
      await supabase.auth.signOut();
      setUser(null);

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ HOOK
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}