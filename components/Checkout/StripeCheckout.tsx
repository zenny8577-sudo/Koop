import React, { useState, useEffect } from 'react';
import { PaymentService } from '../../services/paymentService';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementLocale } from '@stripe/stripe-js';

// Safe environment variable access
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

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
      onError('Payment system configuration error.');
      setInitializing(false);
      return;
    }

    const createPaymentIntent = async () => {
      try {
        // Amount is passed in Euros, convert to cents for Stripe
        const { clientSecret } = await PaymentService.createPaymentIntent(amount * 100); 
        setClientSecret(clientSecret);
      } catch (error) {
        console.error("Init payment error", error);
        onError(error instanceof Error ? error.message : 'Kan betaling niet initialiseren.');
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
          // Em produção, isso deve ser a URL real da sua página de sucesso
          return_url: `${window.location.origin}/`,
        },
        redirect: 'if_required' // Tenta completar sem redirecionar se possível (experiência mais fluida)
      });

      if (error) {
        onError(error.message || 'Betaling mislukt.');
      } else {
        // Payment successful!
        onSuccess();
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Er is een onverwachte fout opgetreden.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing || !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-10 h-10 border-4 border-[#FF4F00] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Beveiligde verbinding starten...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">SSL Beveiligd</span>
        </div>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="px-12 py-5 bg-[#FF4F00] text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-900 transition-all transform hover:-translate-y-1 shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {loading ? 'Verwerken...' : `Betalen € ${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
        </button>
      </div>
    </form>
  );
};

const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  if (!stripePromise) return null;

  // Custom styling to match Koop theme
  const appearance = {
    theme: 'flat' as const,
    variables: {
      fontFamily: 'Inter, sans-serif',
      colorPrimary: '#FF4F00',
      colorBackground: '#ffffff',
      colorText: '#0f172a',
      colorDanger: '#e11d48',
      borderRadius: '16px', // Matches our rounded-2xl
      spacingUnit: '5px',
    },
    rules: {
      '.Input': {
        border: '1px solid #f1f5f9',
        boxShadow: 'none',
        padding: '16px',
        backgroundColor: '#ffffff'
      },
      '.Input:focus': {
        border: '1px solid #FF4F00',
        boxShadow: '0 0 0 4px rgba(255, 79, 0, 0.1)',
      },
      '.Label': {
        fontWeight: '800',
        textTransform: 'uppercase',
        fontSize: '10px',
        letterSpacing: '0.1em',
        color: '#94a3b8',
        marginBottom: '8px'
      }
    }
  };

  return (
    <Elements stripe={stripePromise} options={{ 
      mode: 'payment', 
      currency: 'eur', 
      amount: Math.round(props.amount * 100), // Required for elements requiring amount upfront
      appearance,
      locale: 'nl' as StripeElementLocale
    }}>
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;