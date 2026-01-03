import React, { useState, useEffect } from 'react';
import { PaymentService } from '../../services/paymentService';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { clientSecret } = await PaymentService.createPaymentIntent(amount * 100); // Convert to cents
        setClientSecret(clientSecret);
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to initialize payment');
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

  if (!clientSecret) {
    return <div className="text-center py-8">Loading payment...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 bg-[#FF4F00] text-white font-bold rounded-lg hover:bg-[#E04600] transition-colors disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay €${(amount).toFixed(2)}`}
      </button>
    </form>
  );
};

const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  return (
    <Elements stripe={stripePromise} options={{ mode: 'payment', currency: 'eur' }}>
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;