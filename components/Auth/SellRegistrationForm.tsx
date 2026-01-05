import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface SellRegistrationFormProps {
  onSuccess: () => void;
}

const SellRegistrationForm: React.FC<SellRegistrationFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Elektronica',
    estimatedValue: '',
    description: '',
    photo: null as File | null
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({...formData, photo: e.target.files[0]});
      toast.success('Foto toegevoegd!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast.error('Voer een geldig e-mailadres in.');
      return;
    }

    const value = parseFloat(formData.estimatedValue);
    if (isNaN(value) || value <= 0) {
      toast.error('Voer een geldige geschatte waarde in.');
      return;
    }

    if (formData.description.length < 20) {
      toast.error('Geef een iets uitgebreidere omschrijving (min. 20 tekens).');
      return;
    }

    setIsLoading(true);
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Aanvraag succesvol verzonden!');
      onSuccess();
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-20 bg-white rounded-[40px] lg:rounded-[60px] shadow-2xl border border-slate-100 animate-fadeIn">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase">Verkopen bij KOOP<span className="text-[#FF4F00]">.</span></h2>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">Wij cureren alleen de beste items. Meld je aan als verkoper en profiteer van onze premium marktplaats.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
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
                className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all cursor-pointer"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>Elektronica</option>
                <option>Design Meubels</option>
                <option>Fietsen</option>
                <option>Vintage Mode</option>
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
            
            {/* Image Upload */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Foto van het item</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`w-full bg-slate-50 border-2 border-dashed ${formData.photo ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'} rounded-3xl p-8 text-center transition-all group-hover:bg-slate-100 flex flex-col items-center justify-center gap-3`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.photo ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400'}`}>
                    {formData.photo ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {formData.photo ? formData.photo.name : 'Klik om foto te uploaden'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Wat wil je verkopen?</label>
              <textarea
                required
                placeholder="Vertel ons meer over het item, de staat en eventuele accessoires..."
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