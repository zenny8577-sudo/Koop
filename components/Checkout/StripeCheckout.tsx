import React, { useState, useEffect } from 'react';
import { PaymentService } from '../../services/paymentService';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Safe environment variable access
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Validate Stripe key exists
if (!stripePublicKey) {
  console.warn('VITE_STRIPE_PUBLIC_KEY is not set. Stripe payments will not work in production.');
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

interface StripeCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripeCheckoutForm: React.FC<{ amount: number; onSuccess: () => void; onError: (error: string) => void }> = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!stripePublicKey) {
      onError('Stripe public key not configured. Please set VITE_STRIPE_PUBLIC_KEY in your environment variables.');
      setInitializing(false);
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const { clientSecret } = await PaymentService.createPaymentIntent(amount * 100); // Convert to cents
        setClientSecret(clientSecret);
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to initialize payment');
      } finally {
        setInitializing(false);
      }
    };

    createPaymentIntent();
  }, [amount, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else {
        onSuccess();
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  if (!stripePublicKey) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
        <p className="text-rose-600 font-bold text-sm">Stripe not configured</p>
        <p className="text-rose-400 text-xs">Set VITE_STRIPE_PUBLIC_KEY to enable payments</p>
      </div>
    );
  }

  if (initializing || !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <div className="w-8 h-8 border-2 border-[#FF4F00] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Initializing Payment...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 bg-[#FF4F00] text-white font-bold rounded-lg hover:bg-[#E04600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Pay €${(amount).toFixed(2)}`}
      </button>
    </form>
  );
};

const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  if (!stripePromise) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
        <p className="text-rose-600 font-bold text-sm">Payment System Unavailable</p>
        <p className="text-rose-400 text-xs">Stripe integration not configured</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ mode: 'payment', currency: 'eur' }}>
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;