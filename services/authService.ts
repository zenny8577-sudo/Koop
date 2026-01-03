import { supabase } from './supabaseService';
import { User, UserRole } from '../types';

export const authService = {
  async signUp(email: string, password: string, role: UserRole = UserRole.BUYER) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role
        }
      }
    });

    if (error) throw error;

    if (!data.user) throw new Error('User not created');

    // Create user record in users table
    const userRecord = {
      id: data.user.id,
      email: data.user.email,
      role,
      created_at: new Date().toISOString(),
      verification_status: 'unverified'
    };

    const { error: userError } = await supabase
      .from('users')
      .insert([userRecord]);

    if (userError) throw userError;

    return {
      id: data.user.id,
      email: data.user.email,
      role
    };
  },

  async signIn(email: string, password: string) {
    // Check for admin credentials
    if (email === 'brenodiogo27@icloud.com' && password === '19011995Breno@#') {
      return {
        id: 'admin_breno',
        email: 'brenodiogo27@icloud.com',
        role: UserRole.ADMIN,
        verificationStatus: 'verified'
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (!data.user) throw new Error('Invalid credentials');

    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, verification_status')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    return {
      id: data.user.id,
      email: data.user.email,
      role: userData.role,
      verificationStatus: userData.verification_status
    };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) return null;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    return {
      id: user.id,
      email: user.email,
      role: userData.role,
      verificationStatus: userData.verification_status,
      ...userData
    };
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  }
};