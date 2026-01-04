import React, { useState } from 'react';

interface SellRegistrationFormProps {
  onSuccess: () => void;
}

const SellRegistrationForm: React.FC<SellRegistrationFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Elektronica',
    estimatedValue: '',
    description: ''
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!validateEmail(formData.email)) {
      setError('Voer een geldig e-mailadres in.');
      return;
    }

    const value = parseFloat(formData.estimatedValue);
    if (isNaN(value) || value <= 0) {
      setError('Voer een geldige geschatte waarde in.');
      return;
    }

    if (formData.description.length < 20) {
      setError('Geef een iets uitgebreidere omschrijving (min. 20 tekens).');
      return;
    }

    setIsLoading(true);
    console.log('Seller registration submitted:', formData);
    // Simulação de envio para o CRM
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-12 lg:p-20 bg-white rounded-[60px] shadow-2xl border border-slate-100 animate-fadeIn">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Verkopen bij KOOP<span className="text-[#FF4F00]">.</span></h2>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">Wij cureren alleen de beste items. Meld je aan als verkoper en profiteer van onze premium marktplaats.</p>
        </div>

        {error && (
          <div className="p-6 bg-rose-50 border border-rose-100 rounded-[32px] flex items-center gap-4 animate-slideIn">
            <svg className="w-6 h-6 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-[11px] font-black uppercase tracking-widest text-rose-500">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Standard', rate: '15%', desc: 'Tot €1.000' },
            { label: 'Premium', rate: '12%', desc: '€1.000 - €5.000' },
            { label: 'Exclusive', rate: '8%', desc: 'Boven €5.000' },
          ].map(tier => (
            <div key={tier.label} className="p-8 rounded-[40px] bg-slate-50 text-center border border-slate-100 hover:border-[#FF4F00] transition-colors group">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#FF4F00]">{tier.label} Tier</span>
              <p className="text-4xl font-black text-slate-900 mt-2">{tier.rate}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Commissie</p>
              <p className="text-xs font-medium text-slate-500 mt-4">{tier.desc}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Naam</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">E-mail</label>
              <input
                type="email"
                required
                className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Categorie</label>
              <select
                className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>Elektronica</option>
                <option>Design Meubels</option>
                <option>Fietsen</option>
                <option>Andere</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Geschatte Waarde (€)</label>
              <input
                type="number"
                required
                className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                value={formData.estimatedValue}
                onChange={e => setFormData({...formData, estimatedValue: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Wat wil je verkopen?</label>
              <textarea
                required
                placeholder="Vertel ons meer over het item, de staat e eventuele accessoires..."
                className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all h-32"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-7 bg-slate-950 text-white font-black rounded-3xl uppercase tracking-widest text-[12px] shadow-2xl hover:bg-[#FF4F00] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verzenden...' : 'Aanvraag Versturen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellRegistrationForm;