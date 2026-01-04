import { loadStripe } from '@stripe/stripe-js';

interface ImportMeta {
  env?: {
    VITE_STRIPE_PUBLIC_KEY?: string;
  };
}

const stripePublicKey = (import.meta as any).env?.VITE_STRIPE_PUBLIC_KEY;

export class PaymentService {
  static async createPaymentIntent(amount: number, currency: string = 'EUR') {
    if (!stripePublicKey) {
      throw new Error('Stripe public key not configured. Please set VITE_STRIPE_PUBLIC_KEY in your environment variables.');
    }

    // Mock implementation for development
    // In production, this would call your backend endpoint
    return {
      clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`
    };
  }

  static async handlePayment(clientSecret: string) {
    if (!stripePublicKey) {
      throw new Error('Stripe not configured');
    }

    const stripe = await loadStripe(stripePublicKey);
    if (!stripe) throw new Error('Stripe not loaded');

    const { error } = await stripe.confirmPayment({
      elements: null as any,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) throw error;

    return { success: true };
  }

  static async createCheckoutSession(items: any[]) {
    if (!stripePublicKey) {
      throw new Error('Stripe public key not configured');
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return response.json();
  }
}