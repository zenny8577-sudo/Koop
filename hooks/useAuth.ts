import { useState, useEffect } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { User, UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapProfileToUser = (profile: any): User => {
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

  const loadUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          const { data: authUser } = await supabase.auth.getUser();
          const isAdmin = authUser.user?.email === 'brenodiogo27@icloud.com';
          
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([{
              id: userId,
              email: authUser.user?.email,
              role: isAdmin ? 'ADMIN' : 'BUYER',
              verification_status: isAdmin ? 'verified' : 'unverified',
              first_name: isAdmin ? 'Breno' : undefined,
              last_name: isAdmin ? 'Diogo' : undefined,
              created_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (createError) throw createError;
          const mappedUser = mapProfileToUser(newProfile);
          setUser(mappedUser);
          return mappedUser;
        }
        throw profileError;
      }

      const mappedUser = mapProfileToUser(profile);
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
          await loadUserProfile(session.user.id);
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
        await loadUserProfile(session.user.id);
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
      // Special handling for admin user to ensure creation on first login
      if (cleanEmail === 'brenodiogo27@icloud.com') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            console.log('Admin user not found, attempting to create...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: cleanEmail,
              password,
              options: {
                data: {
                  first_name: 'Breno',
                  last_name: 'Diogo',
                  role: UserRole.ADMIN,
                },
              },
            });

            if (signUpError) throw signUpError;
            if (!signUpData.user) throw new Error('Admin user creation failed.');
            
            await new Promise(resolve => setTimeout(resolve, 500));
            const userProfile = await loadUserProfile(signUpData.user.id);
            return userProfile;
          }
          throw error;
        }
        
        if (!data.user) throw new Error('Login failed');
        const userProfile = await loadUserProfile(data.user.id);
        return userProfile;

      } else {
        // Standard login for regular users
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('Login failed');
        const userProfile = await loadUserProfile(data.user.id);
        return userProfile;
      }
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
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Signup failed');

      await new Promise(resolve => setTimeout(resolve, 1000));
      const userProfile = await loadUserProfile(data.user.id);
      
      return userProfile;
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Signup failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    signUp
  };
}