import { useState, useEffect } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { User, UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          const { data: authUser } = await supabase.auth.getUser();
          
          // Check if this is the admin user
          const isAdmin = authUser.user?.email === 'brenodiogo27@icloud.com';
          
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([{
              id: userId,
              email: authUser.user?.email,
              role: isAdmin ? UserRole.ADMIN : UserRole.BUYER,
              verification_status: isAdmin ? 'verified' : 'unverified',
              first_name: isAdmin ? 'Breno' : undefined,
              last_name: isAdmin ? 'Diogo' : undefined,
              created_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (createError) throw createError;
          setUser(newProfile);
          return;
        }
        throw profileError;
      }

      setUser(profile);
    } catch (err) {
      console.error('Profile load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Special handling for admin credentials
      if (email === 'brenodiogo27@icloud.com' && password === '19011995Breno@#') {
        // Try to sign in with Supabase first
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          // If user doesn't exist in Supabase, create it
          if (error.message.includes('Invalid login credentials')) {
            console.log('Admin user not found in Supabase, creating...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  first_name: 'Breno',
                  last_name: 'Diogo',
                  role: UserRole.ADMIN
                }
              }
            });

            if (signUpError) throw signUpError;
            if (!signUpData.user) throw new Error('Signup failed');

            // Wait for trigger to create profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            await loadUserProfile(signUpData.user.id);
            return signUpData.user;
          }
          throw error;
        }

        if (!data.user) throw new Error('Login failed');
        await loadUserProfile(data.user.id);
        return data.user;
      }

      // Regular login for other users
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error('Login failed');

      await loadUserProfile(data.user.id);
      return data.user;
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
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
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole = UserRole.BUYER, firstName?: string, lastName?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
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

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadUserProfile(data.user.id);
      
      return data.user;
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Signup failed');
      throw err;
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