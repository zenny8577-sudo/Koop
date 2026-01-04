import { loadStripe } from '@stripe/stripe-js';

// A chave deve estar no arquivo .env como VITE_STRIPE_PUBLIC_KEY
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export class PaymentService {
  static async createPaymentIntent(amount: number, currency: string = 'EUR') {
    if (!stripePublicKey) {
      console.warn('Stripe Public Key não encontrada. Usando modo de simulação.');
      // Simulação para não travar o app se a chave não estiver configurada
      return {
        clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`
      };
    }

    // Em produção, isso chamaria seu backend (Supabase Edge Function)
    // Para testar o fluxo visual, retornamos um mock se não houver backend conectado
    return {
      clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`
    };
  }

  static async getStripe() {
    if (!stripePublicKey) return null;
    return loadStripe(stripePublicKey);
  }
}