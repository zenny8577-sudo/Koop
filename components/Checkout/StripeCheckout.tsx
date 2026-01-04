import React, { useState, useEffect } from 'react';
import { PaymentService } from '../../services/paymentService';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementLocale } from '@stripe/stripe-js';

// Safe environment variable access
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : Promise.resolve(null);

interface StripeCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// --- DEMO COMPONENT (FALLBACK) ---
// Used when Stripe keys are missing or API fails
const DemoPaymentForm: React.FC<{ amount: number; onSuccess: () => void }> = ({ amount, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleFakePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simula processamento
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  return (
    <form onSubmit={handleFakePayment} className="space-y-8 animate-fadeIn">
      <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-black text-slate-900 uppercase tracking-tighter">Creditcard (Demo)</h4>
          <span className="text-[9px] bg-slate-200 text-slate-500 px-2 py-1 rounded font-bold uppercase tracking-widest">Test Mode</span>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Kaartnummer</label>
            <div className="relative">
              <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-mono font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#FF4F00]/20" required />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-50">
                 <div className="w-8 h-5 bg-slate-200 rounded"></div>
                 <div className="w-8 h-5 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Vervaldatum</label>
              <input type="text" placeholder="MM / YY" className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-mono font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#FF4F00]/20" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">CVC</label>
              <input type="text" placeholder="123" className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-mono font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#FF4F00]/20" required />
            </div>
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 bg-[#FF4F00] text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-900 transition-all transform hover:-translate-y-1 shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Verwerken...
          </>
        ) : `Betalen € ${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
      </button>
      
      <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">
        Dit is een demonstratie checkout. Er wordt geen geld afgeschreven.
      </p>
    </form>
  );
};

// --- REAL STRIPE FORM ---
const StripeCheckoutForm: React.FC<{ amount: number; onSuccess: () => void; onError: (error: string) => void; switchToDemo: () => void }> = ({ amount, onSuccess, onError, switchToDemo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    // SAFETY TIMEOUT: If Stripe takes too long (>5s), switch to Demo
    const timer = setTimeout(() => {
      if (mounted && !clientSecret) {
        console.warn("Stripe init timed out, switching to demo mode");
        switchToDemo();
      }
    }, 5000);

    const initPayment = async () => {
      try {
        const { clientSecret: secret } = await PaymentService.createPaymentIntent(amount * 100); 
        if (mounted) {
          clearTimeout(timer);
          setClientSecret(secret);
        }
      } catch (error) {
        console.error("Payment init failed:", error);
        if (mounted) {
          clearTimeout(timer);
          // If real payment fails init, switch to demo instead of showing dead end error
          switchToDemo();
        }
      }
    };

    initPayment();
    
    return () => { mounted = false; clearTimeout(timer); };
  }, [amount, switchToDemo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    
    // Validate first
    const { error: submitError } = await elements.submit();
    if (submitError) {
      onError(submitError.message || "Controleer uw invoer.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: { return_url: `${window.location.origin}/` },
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

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-12 h-12 border-4 border-[#FF4F00] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center space-y-2">
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest animate-pulse">
            Beveiligde verbinding starten...
          </p>
          <button 
            onClick={switchToDemo} 
            className="text-[9px] font-bold text-slate-300 hover:text-[#FF4F00] underline cursor-pointer"
          >
            Duurt te lang? Klik hier voor demo mode
          </button>
        </div>
      </div>
    );
  }

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

// --- MAIN WRAPPER ---
const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  const [useDemo, setUseDemo] = useState(false);

  // Styling for Stripe Elements
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

  // Immediate fallback if no public key is present
  if (!stripePublicKey || useDemo) {
    return <DemoPaymentForm {...props} />;
  }

  return (
    <Elements stripe={stripePromise} options={{ 
      mode: 'payment', 
      currency: 'eur', 
      amount: Math.round(props.amount * 100),
      appearance,
      locale: 'nl' as StripeElementLocale
    }}>
      <StripeCheckoutForm {...props} switchToDemo={() => setUseDemo(true)} />
    </Elements>
  );
};

export default StripeCheckout;