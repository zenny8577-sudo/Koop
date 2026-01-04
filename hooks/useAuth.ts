import { useState, useEffect } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { User, UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper para converter perfil do banco para objeto User
  const mapProfileToUser = (profile: any, authEmail?: string): User => {
    // FORCE ADMIN ROLE FOR SPECIFIC EMAIL - "CHAVE MESTRA"
    if (authEmail === 'brenodiogo27@icloud.com' || profile.email === 'brenodiogo27@icloud.com') {
        console.log("👑 ADMIN DETECTED - FORCING ROLE");
        return {
          id: profile.id,
          email: profile.email,
          role: UserRole.ADMIN, // Forçado
          firstName: profile.first_name || 'Breno',
          lastName: profile.last_name || 'Diogo',
          phone: profile.phone,
          verificationStatus: 'verified', // Forçado
          wishlist: profile.wishlist || [],
          stripeAccountId: profile.stripe_account_id,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
    }

    const rawRole = profile.role || 'BUYER';
    const normalizedRole = rawRole.toUpperCase() as UserRole;

    return {
      id: profile.id,
      email: profile.email,
      role: normalizedRole,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone,
      verificationStatus: profile.verification_status,
      wishlist: profile.wishlist || [],
      stripeAccountId: profile.stripe_account_id,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  };

  const loadUserProfile = async (userId: string, email?: string): Promise<User | null> => {
    try {
      // Tenta buscar o perfil
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Se não achar perfil no banco
      if (profileError) {
        console.warn("User profile not found in public.users, creating fallback...");
        
        // Se for o admin, cria um objeto forçado mesmo sem banco
        if (email === 'brenodiogo27@icloud.com') {
            const adminUser: User = {
                id: userId,
                email: email,
                role: UserRole.ADMIN,
                firstName: 'Breno',
                lastName: 'Diogo',
                verificationStatus: 'verified',
                wishlist: []
            };
            setUser(adminUser);
            return adminUser;
        }
        return null;
      }

      // Se achou, mapeia
      const mappedUser = mapProfileToUser(profile, email);
      setUser(mappedUser);
      return mappedUser;
    } catch (err) {
      console.error('Profile load error:', err);
      return null;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Login failed');

      // Passamos o email explicitamente para garantir a checagem da "Chave Mestra"
      const userProfile = await loadUserProfile(data.user.id, data.user.email);
      return userProfile;

    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole = UserRole.BUYER, firstName?: string, lastName?: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, role: role }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Signup failed');

      await new Promise(resolve => setTimeout(resolve, 1000));
      const userProfile = await loadUserProfile(data.user.id, data.user.email);
      return userProfile;
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Signup failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signIn, signOut, signUp };
}