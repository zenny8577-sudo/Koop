import { loadStripe } from '@stripe/stripe-js';

// Type declaration for import.meta.env
declare const importMetaEnv: {
  VITE_STRIPE_PUBLIC_KEY?: string;
};

const stripePromise = loadStripe((import.meta as any).env?.VITE_STRIPE_PUBLIC_KEY);

export class PaymentService {
  static async createPaymentIntent(amount: number, currency: string = 'EUR') {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return response.json();
  }

  static async handlePayment(clientSecret: string) {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe not loaded');

    const { error } = await stripe.confirmPayment({
      elements: null,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) throw error;
    return { success: true };
  }

  static async createCheckoutSession(items: any[]) {
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