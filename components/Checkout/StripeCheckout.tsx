import React, { useState, useEffect } from 'react';
import { PaymentService } from '../../services/paymentService';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementLocale } from '@stripe/stripe-js';

// Load Stripe with the Public Key from environment variables
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe has not loaded yet
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // 1. Validate fields first
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || "Controleer uw invoer.");
      setIsProcessing(false);
      return;
    }

    try {
      // 2. Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/`,
        },
        redirect: 'if_required' // Handle redirect manually or stay on page if no redirect needed
      });

      if (error) {
        setErrorMessage(error.message || 'Betaling mislukt.');
        onError(error.message || 'Betaling mislukt.');
      } else {
        // Payment successful
        onSuccess();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Onverwachte fout.';
      setErrorMessage(msg);
      onError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Payment Element Container */}
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 min-h-[200px]">
        <PaymentElement 
          options={{ 
            layout: 'tabs',
            paymentMethodOrder: ['ideal', 'card', 'bancontact'] 
          }} 
        />
      </div>
      
      {/* Error Display */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {errorMessage}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">SSL Beveiligd (Live)</span>
        </div>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="px-12 py-5 bg-[#FF4F00] text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-900 transition-all transform hover:-translate-y-1 shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Verwerken...</span>
            </>
          ) : (
            `Betalen € ${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`
          )}
        </button>
      </div>
    </form>
  );
};

const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializePayment = async () => {
      try {
        setIsLoading(true);
        setInitError(null);
        
        // Call backend to create PaymentIntent
        const { clientSecret: secret } = await PaymentService.createPaymentIntent(props.amount * 100);
        
        if (mounted) {
          setClientSecret(secret);
        }
      } catch (error) {
        console.error("Stripe Init Error:", error);
        if (mounted) {
          setInitError("Kan beveiligde betaling niet initialiseren. Controleer uw verbinding.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    if (props.amount > 0) {
      initializePayment();
    }

    return () => { mounted = false; };
  }, [props.amount]);

  // Case 1: Missing API Key Configuration
  if (!stripePromise) {
    return (
      <div className="bg-rose-50 p-8 rounded-[32px] border border-rose-100 text-center space-y-4">
        <h3 className="text-rose-600 font-black uppercase">Configuratie Fout</h3>
        <p className="text-rose-500 text-sm">VITE_STRIPE_PUBLIC_KEY ontbreekt in de omgeving.</p>
      </div>
    );
  }

  // Case 2: Loading State (Waiting for Client Secret)
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-fadeIn">
        <div className="w-12 h-12 border-4 border-[#FF4F00] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest animate-pulse">
          Verbinding maken met bank...
        </p>
      </div>
    );
  }

  // Case 3: Initialization Error (Server failure or Network issue)
  if (initError || !clientSecret) {
    return (
      <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-200 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-slate-900 font-black uppercase">Verbinding Mislukt</h3>
          <p className="text-slate-500 text-sm">{initError || "Geen antwoord van betaalserver."}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#FF4F00] transition-colors"
        >
          Opnieuw Proberen
        </button>
      </div>
    );
  }

  // Case 4: Ready to Render Payment Form
  return (
    <Elements stripe={stripePromise} options={{ 
      clientSecret,
      appearance: {
        theme: 'flat',
        variables: {
          fontFamily: 'Inter, sans-serif',
          colorPrimary: '#FF4F00',
          colorBackground: '#ffffff',
          colorText: '#0f172a',
          borderRadius: '16px',
        }
      },
      locale: 'nl' 
    }}>
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;