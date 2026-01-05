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

const shippingLogos: Record<string, string> = {
  postnl: '/assets/postnl.png',
  dhl: '/assets/dhl.png',
  fedex: '/assets/fedex.png'
};

// Component moved outside to prevent re-mounting on every render
const InputField = ({ label, value, onChange, placeholder, type = "text", half = false }: any) => (
  <div className={`space-y-3 ${half ? 'md:col-span-1' : 'md:col-span-2'}`}>
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder} 
      required 
      className="w-full bg-slate-50 border border-transparent focus:border-[#FF4F00]/20 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:ring-4 focus:ring-orange-500/5" 
    />
  </div>
);

const CheckoutView: React.FC<CheckoutViewProps> = ({ items, onComplete, onBack }) => {
  const [step, setStep] = useState<'info' | 'shipping' | 'payment'>('info');
  const [address, setAddress] = useState<Address>({
    firstName: '', lastName: '', email: '', street: '', houseNumber: '', city: '', zipCode: '', phone: ''
  });
  const [shippingMethod, setShippingMethod] = useState<'postnl' | 'dhl' | 'fedex'>('postnl');
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingFee = shippingPrices[shippingMethod];
  const total = subtotal + shippingFee;

  const handlePaymentSuccess = () => {
    AnalyticsService.trackEvent('checkout_completed', {
      items_count: items.length,
      total_amount: total,
      method: 'stripe'
    });
    onComplete(address, 'stripe');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Minimalista */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50 h-20 flex items-center px-6 lg:px-12">
        <div onClick={onBack} className="cursor-pointer flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">Terug naar winkel</span>
        </div>
        <div className="mx-auto flex items-center gap-2">
           <span className="font-black tracking-tighter text-xl">KOOP<span className="text-[#FF4F00]">.</span> CHECKOUT</span>
        </div>
        <div className="w-32 hidden lg:block"></div> {/* Spacer */}
      </header>

      <div className="pt-32 pb-20 max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Main Column */}
          <div className="flex-1 max-w-2xl">
            {/* Progress Indicators */}
            <div className="flex items-center gap-4 mb-12">
              {['info', 'shipping', 'payment'].map((s, i) => {
                const isActive = step === s;
                const isPast = ['info', 'shipping', 'payment'].indexOf(step) > i;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${isActive ? 'bg-[#FF4F00] text-white shadow-lg shadow-orange-500/20' : isPast ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300'}`}>
                      {isPast ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                      {s === 'info' ? 'Gegevens' : s === 'shipping' ? 'Verzending' : 'Betaling'}
                    </span>
                    {i < 2 && <div className="w-8 h-[2px] bg-slate-100 mx-2" />}
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4">
                <div className="w-8 h-8 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center">!</div>
                <p className="text-xs font-bold text-rose-600">{error}</p>
                <button onClick={() => setError(null)} className="ml-auto text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600">Sluiten</button>
              </div>
            )}

            <div className="animate-fadeIn">
              {step === 'info' && (
                <div className="space-y-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Wie ben je?</h2>
                    <p className="text-slate-400 text-sm font-medium">Vul je gegevens in voor de factuur.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="E-mailadres" value={address.email} onChange={(v: string) => setAddress({...address, email: v})} placeholder="jouw@email.com" type="email" />
                    <InputField label="Voornaam" value={address.firstName} onChange={(v: string) => setAddress({...address, firstName: v})} placeholder="Voornaam" half />
                    <InputField label="Achternaam" value={address.lastName} onChange={(v: string) => setAddress({...address, lastName: v})} placeholder="Achternaam" half />
                  </div>

                  <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2 mt-8">Waarheen?</h2>
                    <p className="text-slate-400 text-sm font-medium">Het adres waar we je aankoop bezorgen.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Straat & Huisnummer" value={address.street} onChange={(v: string) => setAddress({...address, street: v})} placeholder="Keizersgracht 123" />
                    <InputField label="Postcode" value={address.zipCode} onChange={(v: string) => setAddress({...address, zipCode: v})} placeholder="1015 CJ" half />
                    <InputField label="Stad" value={address.city} onChange={(v: string) => setAddress({...address, city: v})} placeholder="Amsterdam" half />
                    <InputField label="Telefoon (voor koerier)" value={address.phone} onChange={(v: string) => setAddress({...address, phone: v})} placeholder="+31 6 12345678" />
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={() => {
                        if(!address.email || !address.street || !address.city) {
                          setError('Vul alle verplichte velden in.');
                          return;
                        }
                        setError(null);
                        setStep('shipping');
                      }}
                      className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-[#FF4F00] transition-all transform hover:-translate-y-1 shadow-xl"
                    >
                      Doorgaan naar Verzending
                    </button>
                  </div>
                </div>
              )}

              {step === 'shipping' && (
                <div className="space-y-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Levering</h2>
                    <p className="text-slate-400 text-sm font-medium">Kies hoe je je pakket wilt ontvangen.</p>
                  </div>

                  <div className="space-y-4">
                    {['postnl', 'dhl', 'fedex'].map((method) => (
                      <div 
                        key={method}
                        onClick={() => setShippingMethod(method as any)}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${shippingMethod === method ? 'border-[#FF4F00] bg-orange-50/10' : 'border-slate-50 hover:border-slate-200'}`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${shippingMethod === method ? 'border-[#FF4F00]' : 'border-slate-200'}`}>
                            {shippingMethod === method && <div className="w-2.5 h-2.5 rounded-full bg-[#FF4F00]" />}
                          </div>
                          
                          {/* Carrier Logo */}
                          <div className="w-16 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-100 p-1">
                            <img src={shippingLogos[method]} alt={method} className="max-w-full max-h-full object-contain" />
                          </div>

                          <div>
                            <p className="font-bold text-slate-900 text-sm">{shippingLabels[method]}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                              {method === 'postnl' ? '2-3 Werkdagen' : method === 'dhl' ? 'Volgende dag' : 'Express Service'}
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-slate-900">€ {shippingPrices[method].toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                      onClick={() => setStep('info')}
                      className="px-8 py-5 bg-slate-50 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-100 transition-all"
                    >
                      Terug
                    </button>
                    <button 
                      onClick={() => setStep('payment')}
                      className="flex-1 py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-[#FF4F00] transition-all transform hover:-translate-y-1 shadow-xl"
                    >
                      Naar Betaling
                    </button>
                  </div>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Afrekenen</h2>
                    <p className="text-slate-400 text-sm font-medium">Veilig betalen via onze partner Stripe.</p>
                  </div>

                  <StripeCheckout 
                    amount={total} 
                    onSuccess={handlePaymentSuccess} 
                    onError={(msg) => setError(msg)} 
                  />
                  
                  <div className="flex justify-center">
                     <button onClick={() => setStep('shipping')} className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest">Terug naar verzending</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Summary Sidebar */}
          <div className="lg:w-[420px] shrink-0">
            <div className="sticky top-32 bg-slate-50 rounded-[40px] p-8 lg:p-10 border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8">Overzicht</h3>
              
              <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-4 items-start">
                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-100">
                      <img src={item.product.image} className="w-full h-full object-cover" alt={item.product.title} />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-xs font-black text-slate-900 line-clamp-1">{item.product.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.product.category} x{item.quantity}</p>
                    </div>
                    <p className="text-xs font-black text-slate-900 pt-1">€ {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-8 border-t border-slate-200/50">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Subtotaal</span>
                  <span>€ {subtotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Verzending</span>
                  <span>€ {shippingFee.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>BTW (21%)</span>
                  <span>Inbegrepen</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 mt-6 border-t border-slate-200">
                <span className="text-lg font-black text-slate-900 uppercase tracking-tight">Totaal</span>
                <span className="text-3xl font-black text-[#FF4F00] tracking-tighter">€ {total.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="mt-8 flex gap-2 justify-center opacity-40 grayscale">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" />
                 <img src="/assets/ideal.png" className="h-4 w-auto object-contain" alt="iDEAL" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutView;