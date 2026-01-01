
import React, { useState } from 'react';
import { CartItem, Address } from '../../types';

interface CheckoutViewProps {
  items: CartItem[];
  onComplete: (address: Address, paymentMethod: string) => void;
  onBack: () => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ items, onComplete, onBack }) => {
  const [step, setStep] = useState<'info' | 'shipping' | 'payment'>('info');
  const [address, setAddress] = useState<Address>({
    firstName: '', lastName: '', email: '', street: '', houseNumber: '', city: '', zipCode: '', phone: ''
  });
  const [shippingMethod, setShippingMethod] = useState<'postnl' | 'dhl'>('postnl');
  const [paymentMethod, setPaymentMethod] = useState<'ideal' | 'card'>('ideal');

  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const total = subtotal + 6.95;

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
                  <InputField label="E-mail" value={address.email} onChange={(v: string) => setAddress({...address, email: v})} placeholder="jouw@email.com" type="email" />
                </section>

                <section className="space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Bezorgadres</h2>
                  <div className="flex flex-col md:flex-row gap-6">
                    <InputField label="Voornaam" value={address.firstName} onChange={(v: string) => setAddress({...address, firstName: v})} placeholder="Voornaam" half />
                    <InputField label="Achternaam" value={address.lastName} onChange={(v: string) => setAddress({...address, lastName: v})} placeholder="Achternaam" half />
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                    <InputField label="Straat & Huisnummer" value={address.street} onChange={(v: string) => setAddress({...address, street: v})} placeholder="Keizersgracht 123" />
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                    <InputField label="Postcode" value={address.zipCode} onChange={(v: string) => setAddress({...address, zipCode: v})} placeholder="1234 AB" half />
                    <InputField label="Stad" value={address.city} onChange={(v: string) => setAddress({...address, city: v})} placeholder="Amsterdam" half />
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
                  <div className="p-8 rounded-[40px] border-2 border-[#FF4F00] bg-orange-50/20 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 uppercase tracking-widest text-sm">PostNL Verzekerd</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Geverifieerde levering binnen 2 werkdagen</p>
                    </div>
                    <span className="font-black text-slate-900">€ 6,95</span>
                  </div>
                </section>

                <button 
                  onClick={() => setStep('payment')}
                  className="w-full py-8 bg-slate-900 text-white font-black rounded-[40px] uppercase tracking-widest text-[13px] hover:bg-[#FF4F00] transition-all"
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
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/77/IDEAL_Logo.svg" className="h-5" />
                      <span className="font-black text-slate-900 uppercase tracking-widest text-sm">iDEAL</span>
                    </div>
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`p-8 rounded-[40px] border-2 cursor-pointer transition-all flex items-center gap-6 ${paymentMethod === 'card' ? 'border-[#FF4F00] bg-orange-50/20' : 'border-slate-50 hover:border-slate-200'}`}
                    >
                      <div className="flex gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" />
                      </div>
                      <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Creditcard</span>
                    </div>
                  </div>
                </section>

                <button 
                  onClick={() => onComplete(address, paymentMethod)}
                  className="w-full py-9 bg-slate-900 text-white font-black rounded-[40px] uppercase tracking-widest text-sm shadow-2xl hover:bg-[#FF4F00] transition-all transform hover:-translate-y-1"
                >
                  Nu Veilig Betalen
                </button>
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
                    <img src={item.product.image} className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -top-3 -right-3 bg-slate-900 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{item.product.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.product.category}</p>
                </div>
                <p className="text-sm font-black text-slate-900">€ {(item.product.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6 pt-12 border-t border-slate-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Subtotaal</span>
              <span className="font-black text-slate-900">€ {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Verzending (Verzekerd)</span>
              <span className="font-black text-slate-900">€ 6,95</span>
            </div>
            <div className="flex justify-between items-end pt-10 mt-10 border-t border-slate-200">
              <div>
                <span className="text-slate-900 font-black uppercase tracking-tighter text-2xl block leading-none">Totaal</span>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Inclusief BTW</span>
              </div>
              <span className="text-5xl font-black text-slate-900 tracking-tighter">€ {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
