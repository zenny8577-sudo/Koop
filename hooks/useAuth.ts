import { useState, useEffect } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { User, UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Definição estática das contas de teste para garantir consistência
  const MASTER_ACCOUNTS: Record<string, UserRole> = {
    'brenodiogo27@icloud.com': UserRole.ADMIN,
    'seller@koop.nl': UserRole.SELLER,
    'buyer@koop.nl': UserRole.BUYER
  };

  const getUserRoleByEmail = (email: string, dbRole?: string): UserRole => {
    const cleanEmail = email.toLowerCase().trim();
    if (MASTER_ACCOUNTS[cleanEmail]) {
      console.log(`🔒 Enforcing MASTER ROLE [${MASTER_ACCOUNTS[cleanEmail]}] for ${cleanEmail}`);
      return MASTER_ACCOUNTS[cleanEmail];
    }
    return (dbRole?.toUpperCase() as UserRole) || UserRole.BUYER;
  };

  const mapProfileToUser = (profile: any, email: string): User => {
    const role = getUserRoleByEmail(email, profile?.role);
    
    return {
      id: profile?.id || 'temp-id',
      email: email,
      role: role,
      firstName: profile?.first_name || email.split('@')[0],
      lastName: profile?.last_name || '',
      phone: profile?.phone,
      verificationStatus: role === UserRole.ADMIN || role === UserRole.SELLER ? 'verified' : (profile?.verification_status || 'unverified'),
      wishlist: profile?.wishlist || [],
      stripeAccountId: profile?.stripe_account_id,
      created_at: profile?.created_at,
      updated_at: profile?.updated_at,
    };
  };

  const fetchProfile = async (userId: string, email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) console.warn('Profile fetch warning (using fallback):', error.message);
    
    const userObj = mapProfileToUser(data || { id: userId }, email);
    setUser(userObj);
    return userObj;
  };

  // Inicialização da Sessão
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          await fetchProfile(session.user.id, session.user.email!);
        } else if (mounted) {
          setUser(null);
        }
      } catch (e) {
        console.error("Session init error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`AUTH EVENT: ${event}`);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Tenta Login Normal
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      // 2. Se falhar e for conta MASTER, tenta criar a conta (Auto-Heal)
      if (error && MASTER_ACCOUNTS[cleanEmail]) {
        console.log(`⚠️ Login failed for Master Account ${cleanEmail}. Attempting Auto-Heal (SignUp)...`);
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { 
              role: MASTER_ACCOUNTS[cleanEmail],
              first_name: cleanEmail.split('@')[0]
            }
          }
        });

        if (signUpError) throw signUpError;
        if (signUpData.session) {
          console.log("✅ Auto-Heal Successful. Logged in.");
          return await fetchProfile(signUpData.user!.id, signUpData.user!.email!);
        } else {
          // Caso precise de confirmação de email (improvável em dev local, mas possível)
          // Vamos tentar logar de novo após 1s caso o trigger de auto-confirm do backend tenha rodado
          await new Promise(r => setTimeout(r, 1000));
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
          if (retryError) throw retryError;
          return await fetchProfile(retryData.user.id, retryData.user.email!);
        }
      }

      if (error) throw error;
      
      return await fetchProfile(data.user.id, data.user.email!);

    } catch (err) {
      console.error('Login Error:', err);
      setError(err instanceof Error ? err.message : 'Falha no login');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
     // Redireciona para o signIn pois ele agora tem lógica de criação automática
     return signIn(email, password);
  };

  return { user, loading, error, signIn, signOut, signUp };
}