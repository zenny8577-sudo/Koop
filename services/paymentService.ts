import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../src/integrations/supabase/client';

// A chave pública (pk_live_...) deve estar no .env
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export class PaymentService {
  static async createPaymentIntent(amount: number, currency: string = 'EUR') {
    try {
      // Chama a Edge Function segura
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { 
          amount: amount, // A função já espera o valor (se for em centavos ou euros, ajuste lá. Aqui envio como recebido, a função arredonda)
          currency 
        }
      });

      if (error) throw error;
      if (!data.clientSecret) throw new Error('No client secret returned');

      return {
        clientSecret: data.clientSecret
      };
    } catch (error) {
      console.error('Payment Error:', error);
      
      // Fallback apenas para desenvolvimento se não houver backend
      if (!stripePublicKey) {
        console.warn('Usando Mock Payment (Chaves não configuradas)');
        return {
          clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`
        };
      }
      
      throw error;
    }
  }

  static async getStripe() {
    if (!stripePublicKey) return null;
    return loadStripe(stripePublicKey);
  }
}