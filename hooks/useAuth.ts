import { useState, useEffect } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { User, UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper para converter perfil do banco para objeto User com regras de segurança forçadas
  const mapProfileToUser = (profile: any, authEmail?: string): User => {
    const emailToCheck = (authEmail || profile.email || '').toLowerCase();

    // 1. REGRA MESTRA ADMIN
    if (emailToCheck === 'brenodiogo27@icloud.com') {
        return {
          id: profile.id,
          email: emailToCheck,
          role: UserRole.ADMIN,
          firstName: 'Breno',
          lastName: 'Diogo',
          phone: profile.phone,
          verificationStatus: 'verified',
          wishlist: profile.wishlist || [],
          stripeAccountId: profile.stripe_account_id,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
    }

    // 2. REGRA MESTRA VENDEDOR (Teste)
    if (emailToCheck === 'seller@koop.nl') {
        return {
          id: profile.id,
          email: emailToCheck,
          role: UserRole.SELLER,
          firstName: 'Sjors',
          lastName: 'de Groot',
          phone: profile.phone,
          verificationStatus: 'verified',
          wishlist: profile.wishlist || [],
          stripeAccountId: profile.stripe_account_id,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
    }

    // 3. REGRA MESTRA COMPRADOR (Teste)
    if (emailToCheck === 'buyer@koop.nl') {
        return {
          id: profile.id,
          email: emailToCheck,
          role: UserRole.BUYER,
          firstName: 'Anna',
          lastName: 'van Dijk',
          phone: profile.phone,
          verificationStatus: 'verified',
          wishlist: profile.wishlist || [],
          stripeAccountId: profile.stripe_account_id,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
    }

    // Fluxo normal do banco de dados
    const rawRole = profile.role || 'BUYER';
    const normalizedRole = rawRole.toUpperCase() as UserRole;

    return {
      id: profile.id,
      email: emailToCheck,
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
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Se não achar perfil no banco, usa fallback baseado no email
      if (profileError) {
        console.warn("User profile not found in DB, using fallback logic for:", email);
        const dummyProfile = { id: userId, email: email }; // Objeto mínimo para o mapper funcionar
        return mapProfileToUser(dummyProfile, email);
      }

      return mapProfileToUser(profile, email);
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

      if (error) {
         // Auto-create test users if they don't exist in Auth but we have hardcoded rules
         if (error.message.includes('Invalid login credentials') && 
            ['seller@koop.nl', 'buyer@koop.nl'].includes(cleanEmail)) {
             return await signUp(cleanEmail, password, 
                cleanEmail.includes('seller') ? UserRole.SELLER : UserRole.BUYER
             );
         }
         throw error;
      }
      
      if (!data.user) throw new Error('Login failed');

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

      // Aguarda trigger do banco
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