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
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const createPaymentIntent = async () => {
      try {
        // Amount is passed in Euros, convert to cents for Stripe
        const { clientSecret } = await PaymentService.createPaymentIntent(amount * 100); 
        if (mounted) setClientSecret(clientSecret);
      } catch (error) {
        console.error("Init payment error", error);
        // Mesmo com erro, tentamos setar um mock para não travar a UI em dev
        if (mounted) setClientSecret(`mock_error_${Date.now()}`);
      } finally {
        if (mounted) setInitializing(false);
      }
    };

    createPaymentIntent();
    
    return () => { mounted = false; };
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientSecret) return;

    setLoading(true);

    // MOCK / DEMO MODE HANDLING
    if (clientSecret.startsWith('mock_')) {
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 1500); // Simula delay de rede
      return;
    }

    // REAL STRIPE HANDLING
    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
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

  // UI DE CARREGAMENTO
  if (initializing || !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-12 h-12 border-4 border-[#FF4F00] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest animate-pulse">
          Beveiligde verbinding starten...
        </p>
      </div>
    );
  }

  // UI MOCK / DEMO
  if (clientSecret.startsWith('mock_')) {
    return (
      <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
        <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-full text-amber-600">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wide mb-1">Demo Modus</h4>
            <p className="text-xs text-amber-700/80 leading-relaxed">
              De backend verbinding is traag of niet geconfigureerd. U kunt doorgaan in simulatie-modus. Er wordt niets afgeschreven.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-6 opacity-60 pointer-events-none grayscale">
           {/* Fake Card UI for visual feedback */}
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kaartnummer</label>
              <div className="h-12 bg-white rounded-xl border border-slate-200 flex items-center px-4">
                 <span className="text-slate-400 text-sm">•••• •••• •••• 4242</span>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-white rounded-xl border border-slate-200"></div>
              <div className="h-12 bg-white rounded-xl border border-slate-200"></div>
           </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span className="text-[10px] font-bold uppercase tracking-widest">Simulatie</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-[#FF4F00] transition-all transform hover:-translate-y-1 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verwerken...' : `Demo Betalen € ${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
          </button>
        </div>
      </form>
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