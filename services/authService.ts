
import { User, UserRole } from '../types';

// Em um cenário real, você importaria:
// import { createClient } from '@supabase/supabase-js'

export const authService = {
  // Simula o fluxo do Supabase Auth
  async signUp(email: string, role: UserRole): Promise<User> {
    return {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role,
      stripeAccountId: role === UserRole.SELLER ? 'acct_pending' : undefined
    };
  },

  async signIn(email: string): Promise<User> {
    // Simulação de login
    if (email.includes('admin')) {
      return { id: 'admin_1', email, role: UserRole.ADMIN };
    }
    if (email.includes('seller')) {
      return { id: 'seller_1', email, role: UserRole.SELLER, stripeAccountId: 'acct_123' };
    }
    return { id: 'buyer_1', email, role: UserRole.BUYER };
  },

  async signOut() {
    console.log("Supabase session cleared");
  }
};
