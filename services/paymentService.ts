import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../src/integrations/supabase/client';

// A chave pública (pk_live_...) deve estar no .env
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export class PaymentService {
  static async createPaymentIntent(amount: number, currency: string = 'EUR') {
    try {
      // Create a promise that rejects after 5 seconds (Timeout)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 5000);
      });

      // Race between the actual fetch and the timeout
      const { data, error } = await Promise.race([
        supabase.functions.invoke('create-payment-intent', {
          body: { amount, currency }
        }),
        timeoutPromise.then(() => { throw new Error('Timeout'); })
      ]) as any;

      if (error) throw error;
      if (!data?.clientSecret) throw new Error('No client secret returned');

      return {
        clientSecret: data.clientSecret
      };
    } catch (error) {
      console.warn('Payment Service Error (Falling back to Mock):', error);
      
      // Fallback para desenvolvimento ou erro de rede/timeout
      // Retorna um segredo falso para ativar o modo de demonstração no frontend
      return {
        clientSecret: `mock_secret_${Date.now()}`
      };
    }
  }

  static async getStripe() {
    if (!stripePublicKey) return null;
    return loadStripe(stripePublicKey);
  }
}