import React, { useState, useEffect } from 'react';
import { PaymentService } from '../../services/paymentService';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementLocale } from '@stripe/stripe-js';

// Safe environment variable access
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
// Fallback para carregar o stripePromise mesmo se a chave estiver vazia, para não quebrar o render
// (O erro será tratado dentro do componente)
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : Promise.resolve(null);

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const createPaymentIntent = async () => {
      try {
        setErrorMessage(null);
        // Amount is passed in Euros, convert to cents for Stripe
        const { clientSecret } = await PaymentService.createPaymentIntent(amount * 100); 
        if (mounted) setClientSecret(clientSecret);
      } catch (error) {
        console.error("Init payment error", error);
        if (mounted) setErrorMessage((error as Error).message || 'Kan geen verbinding maken met de betalingsprovider.');
        onError("Payment initialization failed");
      }
    };

    createPaymentIntent();
    
    return () => { mounted = false; };
  }, [amount, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    // 1. Trigger validation first (Required for iDEAL and modern payment methods)
    const { error: submitError } = await elements.submit();
    if (submitError) {
      onError(submitError.message || "Controleer uw invoer.");
      setLoading(false);
      return;
    }

    try {
      // 2. Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/`,
        },
        redirect: 'if_required'
      });

      if (error) {
        onError(error.message || 'Betaling mislukt.');
      } else {
        onSuccess();
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Er is een onverwachte fout opgetreden.');
    } finally {
      setLoading(false);
    }
  };

  // UI DE ERRO INICIAL
  if (errorMessage) {
    return (
      <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100 flex flex-col items-center justify-center text-center space-y-4 py-12">
        <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div>
           <h4 className="font-bold text-rose-900">Verbindingsfout</h4>
           <p className="text-xs text-rose-700 mt-1">{errorMessage}</p>
        </div>
        <button 
           onClick={() => window.location.reload()}
           className="px-6 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors"
        >
          Pagina Verversen
        </button>
      </div>
    );
  }

  // UI DE CARREGAMENTO
  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-12 h-12 border-4 border-[#FF4F00] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest animate-pulse">
          Beveiligde verbinding starten...
        </p>
      </div>
    );
  }

  // UI REAL STRIPE
  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 min-h-[300px]">
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
          className="px-12 py-5 bg-[#FF4F00] text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-900 transition-all transform hover:-translate-y-1 shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verwerken...' : `Betalen € ${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
        </button>
      </div>
    </form>
  );
};

const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  // Custom styling to match Koop theme
  const appearance = {
    theme: 'flat' as const,
    variables: {
      fontFamily: 'Inter, sans-serif',
      colorPrimary: '#FF4F00',
      colorBackground: '#ffffff',
      colorText: '#0f172a',
      borderRadius: '16px',
      spacingUnit: '5px',
    },
    rules: {
      '.Input': { border: '1px solid #f1f5f9', boxShadow: 'none', padding: '16px', backgroundColor: '#ffffff' },
      '.Input:focus': { border: '1px solid #FF4F00', boxShadow: '0 0 0 4px rgba(255, 79, 0, 0.1)' },
      '.Label': { fontWeight: '800', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '8px' }
    }
  };

  return (
    <Elements stripe={stripePromise} options={{ 
      mode: 'payment', 
      currency: 'eur', 
      amount: Math.round(props.amount * 100),
      appearance,
      locale: 'nl' as StripeElementLocale
    }}>
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;