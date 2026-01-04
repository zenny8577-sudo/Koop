import { supabase } from '../src/integrations/supabase/client';
import { User, UserRole } from '../types';

export const authService = {
  async signUp(email: string, password: string, role: UserRole = UserRole.BUYER, firstName?: string, lastName?: string) {
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
    if (!data.user) throw new Error('User not created');

    // The user profile will be created automatically by the trigger
    return {
      id: data.user.id,
      email: data.user.email,
      role
    };
  },

  async signIn(email: string, password: string) {
    // Special case for admin user - create if doesn't exist
    if (email === 'brenodiogo27@icloud.com') {
      // First try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // If user doesn't exist, create it
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
          
          // Get user details from the database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', signUpData.user.id)
            .single();

          if (userError) throw userError;

          return {
            id: signUpData.user.id,
            email: signUpData.user.email,
            role: userData.role || UserRole.ADMIN,
            verificationStatus: userData.verification_status,
            firstName: userData.first_name,
            lastName: userData.last_name,
            phone: userData.phone,
            wishlist: userData.wishlist || []
          };
        }
        throw error;
      }

      if (!data.user) throw new Error('Login failed');

      // Get user details from the database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) throw userError;

      return {
        id: data.user.id,
        email: data.user.email,
        role: userData.role || UserRole.BUYER,
        verificationStatus: userData.verification_status,
        firstName: userData.first_name,
        lastName: userData.last_name,
        phone: userData.phone,
        wishlist: userData.wishlist || []
      };
    }

    // Regular login for other users
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    // Get user details from the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    return {
      id: data.user.id,
      email: data.user.email,
      role: userData.role || UserRole.BUYER,
      verificationStatus: userData.verification_status,
      firstName: userData.first_name,
      lastName: userData.last_name,
      phone: userData.phone,
      wishlist: userData.wishlist || []
    };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Get user details from the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      // If user doesn't exist in our table, create a minimal user object
      return {
        id: user.id,
        email: user.email,
        role: UserRole.BUYER,
        verificationStatus: 'unverified'
      };
    }

    return {
      id: user.id,
      email: user.email,
      role: userData.role || UserRole.BUYER,
      verificationStatus: userData.verification_status,
      firstName: userData.first_name,
      lastName: userData.last_name,
      phone: userData.phone,
      wishlist: userData.wishlist || []
    };
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
};