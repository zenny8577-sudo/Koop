import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../src/integrations/supabase/client';

// A chave pública (pk_live_...) deve estar no .env
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export class PaymentService {
  static async createPaymentIntent(amount: number, currency: string = 'EUR') {
    try {
      console.log('Initiating real payment intent for:', amount, currency);
      
      // Chamada direta à Edge Function sem timeout artificial
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount, currency }
      });

      if (error) {
        console.error('Supabase Function Error:', error);
        throw new Error(`Payment initialization failed: ${error.message}`);
      }

      if (!data?.clientSecret) {
        throw new Error('No client secret returned from Stripe backend');
      }

      return {
        clientSecret: data.clientSecret
      };
    } catch (error) {
      console.error('Critical Payment Service Error:', error);
      throw error; // Lança o erro real para a UI tratar
    }
  }

  static async getStripe() {
    if (!stripePublicKey) return null;
    return loadStripe(stripePublicKey);
  }
}