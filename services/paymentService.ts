import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../src/integrations/supabase/client';

// A chave pública deve estar no .env
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export class PaymentService {
  static async createPaymentIntent(amount: number, currency: string = 'EUR') {
    try {
      console.log('Initiating LIVE payment intent:', amount, currency);
      
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount, currency }
      });

      if (error) {
        console.error('Supabase Edge Function Error:', error);
        throw new Error(error.message || 'Server connection failed');
      }

      if (!data?.clientSecret) {
        console.error('Missing clientSecret in response:', data);
        throw new Error(data?.error || 'Payment configuration error');
      }

      return {
        clientSecret: data.clientSecret
      };
    } catch (error) {
      console.error('Payment Service Critical Error:', error);
      throw error; 
    }
  }

  static async getStripe() {
    if (!stripePublicKey) return null;
    return loadStripe(stripePublicKey);
  }
}