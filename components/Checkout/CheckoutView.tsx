import React, { useState } from 'react';
import { CartItem, Address } from '../../types';
import StripeCheckout from './StripeCheckout';
import { AnalyticsService } from '../../services/analyticsService';

interface CheckoutViewProps {
  items: CartItem[];
  onComplete: (address: Address, paymentMethod: string) => void;
  onBack: () => void;
}

const shippingPrices: Record<string, number> = {
  postnl: 6.95,
  dhl: 8.50,
  fedex: 12.95
};

const shippingLabels: Record<string, string> = {
  postnl: 'PostNL Verzekerd',
  dhl: 'DHL Express',
  fedex: 'FedEx Priority'
};

const CheckoutView: React.FC<CheckoutViewProps> = ({ items, onComplete, onBack }) => {
  const [step, setStep] = useState<'info' | 'shipping' | 'payment'>('info');
  const [address, setAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    houseNumber: '',
    city: '',
    zipCode: '',
    phone: ''
  });
  const [shippingMethod, setShippingMethod] = useState<'postnl' | 'dhl' | 'fedex'>('postnl');
  const [paymentMethod, setPaymentMethod] = useState<'ideal' | 'card'>('ideal');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingFee = shippingPrices[shippingMethod];
  const total = subtotal + shippingFee;

  const InputField = ({ label, value, onChange, placeholder, type = "text", half = false }: any) => (
    <div className={`space-y-2 ${half ? 'md:w-1/2' : 'w-full'}`}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder} 
        required 
        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" 
      />
    </div>
  );

  const handlePaymentSuccess = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real implementation, this would create transactions in Supabase
      for (const item of items) {
        console.log('Creating transaction for item:', item.product.id);
      }
      
      AnalyticsService.trackEvent('checkout_completed', {
        items_count: items.length,
        total_amount: total,
        payment_method: paymentMethod
      });
      
      onComplete(address, paymentMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete order');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto min-h-screen bg-white p-8">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-rose-800 mb-2">Error</h3>
          <p className="text-rose-600">{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Step Flow Area */}
        <div className="flex-1 p-8 lg:p-24 lg:pr-32 border-r border-slate-100">
          <header className="mb-20">
            <div className="flex items-center gap-3 cursor-pointer mb-16" onClick={onBack}>
              <div className="w-10 h-10 bg-[#FF4F00] rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl">K</span>
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">KOOP<span className="text-[#FF4F00]">.</span></span>
            </div>
            <nav className="flex gap-6 items-center text-[11px] font-black uppercase tracking-widest text-slate-400">
              <span className={step === 'info' ? 'text-slate-900' : ''}>Informatie</span>
              <div className="w-4 h-[1px] bg-slate-200" />
              <span className={step === 'shipping' ? 'text-slate-900' : ''}>Verzending</span>
              <div className="w-4 h-[1px] bg-slate-200" />
              <span className={step === 'payment' ? 'text-slate-900' : ''}>Betaling</span>
            </nav>
          </header>
          
          <div className="animate-fadeIn max-w-2xl">
            {step === 'info' && (
              <div className="space-y-16">
                <section className="space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Persoonlijke Gegevens</h2>
                  <InputField 
                    label="E-mail" 
                    value={address.email} 
                    onChange={(v: string) => setAddress({...address, email: v})} 
                    placeholder="jouw@email.com" 
                    type="email" 
                  />
                </section>
                
                <section className="space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Bezorgadres</h2>
                  <div className="flex flex-col md:flex-row gap-6">
                    <InputField 
                      label="Voornaam" 
                      value={address.firstName} 
                      onChange={(v: string) => setAddress({...address, firstName: v})} 
                      placeholder="Voornaam" 
                      half 
                    />
                    <InputField 
                      label="Achternaam" 
                      value={address.lastName} 
                      onChange={(v: string) => setAddress({...address, lastName: v})} 
                      placeholder="Achternaam" 
                      half 
                    />
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                    <InputField 
                      label="Straat & Huisnummer" 
                      value={address.street} 
                      onChange={(v: string) => setAddress({...address, street: v})} 
                      placeholder="Keizersgracht 123" 
                    />
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                    <InputField 
                      label="Postcode" 
                      value={address.zipCode} 
                      onChange={(v: string) => setAddress({...address, zipCode: v})} 
                      placeholder="1234 AB" 
                      half 
                    />
                    <InputField 
                      label="Stad" 
                      value={address.city} 
                      onChange={(v: string) => setAddress({...address, city: v})} 
                      placeholder="Amsterdam" 
                      half 
                    />
                  </div>
                </section>
                
                <button 
                  onClick={() => setStep('shipping')} 
                  className="w-full py-8 bg-slate-900 text-white font-black rounded-[40px] uppercase tracking-widest text-[13px] hover:bg-[#FF4F00] transition-all shadow-2xl shadow-slate-200"
                >
                  Ga naar Verzending
                </button>
              </div>
            )}
            
            {step === 'shipping' && (
              <div className="space-y-16">
                <section className="space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Verzendmethode</h2>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Kies uw bezorger</label>
                    <div className="relative group">
                      <select 
                        value={shippingMethod} 
                        onChange={(e) => setShippingMethod(e.target.value as any)} 
                        className="w-full bg-slate-50 border-none rounded-[32px] px-8 py-6 text-sm font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-orange-500/10 transition-all"
                      >
                        <option value="postnl">PostNL Verzekerd (€ 6,95)</option>
                        <option value="dhl">DHL Express (€ 8,50)</option>
                        <option value="fedex">FedEx Priority (€ 12,95)</option>
                      </select>
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-10 rounded-[48px] border-2 border-[#FF4F00] bg-orange-50/20 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-slate-900 uppercase tracking-widest text-base">{shippingLabels[shippingMethod]}</p>
                      <span className="font-black text-slate-900 text-lg">€ {shippingFee.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                      {shippingMethod === 'postnl' && 'Geverifieerde levering binnen 2 werkdagen via het nationale netwerk.'}
                      {shippingMethod === 'dhl' && 'Versnelde premium levering binnen 24 uur na verwerking.'}
                      {shippingMethod === 'fedex' && 'Hoogste prioriteit e extra beveiligde handling voor luxe items.'}
                    </p>
                  </div>
                </section>
                
                <button 
                  onClick={() => setStep('payment')} 
                  className="w-full py-8 bg-slate-900 text-white font-black rounded-[40px] uppercase tracking-widest text-[13px] hover:bg-[#FF4F00] transition-all shadow-2xl shadow-slate-200"
                >
                  Ga naar Betaling
                </button>
              </div>
            )}
            
            {step === 'payment' && (
              <div className="space-y-16">
                <section className="space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Betalingswijze</h2>
                  <div className="space-y-4">
                    <div 
                      onClick={() => setPaymentMethod('ideal')} 
                      className={`p-8 rounded-[40px] border-2 cursor-pointer transition-all flex items-center gap-6 ${paymentMethod === 'ideal' ? 'border-[#FF4F00] bg-orange-50/20' : 'border-slate-50 hover:border-slate-200'}`}
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/77/IDEAL_Logo.svg" className="h-5" alt="iDEAL" />
                      <span className="font-black text-slate-900 uppercase tracking-widest text-sm">iDEAL</span>
                    </div>
                    <div 
                      onClick={() => setPaymentMethod('card')} 
                      className={`p-8 rounded-[40px] border-2 cursor-pointer transition-all flex items-center gap-6 ${paymentMethod === 'card' ? 'border-[#FF4F00] bg-orange-50/20' : 'border-slate-50 hover:border-slate-200'}`}
                    >
                      <div className="flex gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                      </div>
                      <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Creditcard</span>
                    </div>
                  </div>
                </section>
                
                <div className="space-y-8">
                  <StripeCheckout amount={total} onSuccess={handlePaymentSuccess} onError={(err) => setError(err)} />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar Order Summary */}
        <div className="w-full lg:w-[540px] bg-slate-50 p-8 lg:p-24 space-y-16">
          <div className="space-y-10">
            {items.map(item => (
              <div key={item.product.id} className="flex gap-6 items-center">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <img src={item.product.image} className="w-full h-full object-cover" alt={item.product.title} />
                  </div>
                  <span className="absolute -top-3 -right-3 bg-slate-900 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{item.product.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.product.category}</p>
                </div>
                <p className="text-sm font-black text-slate-900">€ {(item.product.price * item.quantity).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
          
          <div className="space-y-6 pt-12 border-t border-slate-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Subtotaal</span>
              <span className="font-black text-slate-900">€ {subtotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Verzending ({shippingLabels[shippingMethod]})</span>
              <span className="font-black text-slate-900">€ {shippingFee.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-end pt-10 mt-10 border-t border-slate-200">
              <div>
                <span className="text-slate-900 font-black uppercase tracking-tighter text-2xl block leading-none">Totaal</span>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Inclusief BTW</span>
              </div>
              <span className="text-5xl font-black text-slate-900 tracking-tighter">€ {total.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;