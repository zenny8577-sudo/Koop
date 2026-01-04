import React from 'react';

interface SellInfoPageProps {
  onStartRegistration: () => void;
}

const SellInfoPage: React.FC<SellInfoPageProps> = ({ onStartRegistration }) => {
  const steps = [
    { title: 'Aanmelden', desc: 'Registreer je als verkoper e vertel ons wat je wilt verkopen.' },
    { title: 'Curatie', desc: 'Onze experts beoordelen je items binnen 24 uur op echtheid e conditie.' },
    { title: 'Verkoop', desc: 'Zodra goedgekeurd, staat je item live voor duizenden kopers.' },
    { title: 'Uitbetaling', desc: 'Ontvang je geld direct na levering via Stripe Connect.' },
  ];

  const handleStart = () => {
    console.log('Starting seller registration flow');
    onStartRegistration();
  };

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <section className="bg-slate-900 py-32 lg:py-48 px-6 lg:px-10 rounded-[60px] lg:rounded-[100px] mx-4 lg:mx-10 mt-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10">
          <h1 className="text-5xl lg:text-[120px] font-black text-white leading-[0.8] tracking-tighter uppercase">
            Geef je tech <br /> <span className="text-[#FF4F00]">een tweede leven.</span>
          </h1>
          <p className="text-white/60 text-xl font-medium max-w-2xl mx-auto">
            Verkoop je premium elektronica, design e fietsen op het meest vertrouwde platform van Nederland.
          </p>
          <button
            onClick={handleStart}
            className="px-16 py-7 bg-[#FF4F00] text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-white hover:text-slate-900 transition-all transform hover:scale-105 shadow-2xl shadow-orange-500/20"
          >
            Nu Beginnen
          </button>
        </div>
      </section>

      {/* Tiers */}
      <section className="max-w-[1440px] mx-auto px-6 py-40">
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Transparante Commissies<span className="text-[#FF4F00]">.</span></h2>
          <p className="text-slate-500 font-medium">Hoe meer je verkoopt, hoe minder commissie je betaalt.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Standard', rate: '15%', range: 'Items tot €1.000', color: 'bg-slate-50' },
            { label: 'Premium', rate: '12%', range: 'Items €1.000 - €5.000', color: 'bg-slate-900 text-white' },
            { label: 'Exclusive', rate: '8%', range: 'Items boven €5.000', color: 'bg-slate-50' },
          ].map((tier, i) => (
            <div key={tier.label} className={`p-16 rounded-[60px] text-center space-y-6 transition-all hover:-translate-y-4 ${tier.color}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest ${i === 1 ? 'text-orange-400' : 'text-slate-400'}`}>{tier.label} Plan</span>
              <p className="text-7xl font-black tracking-tighter">{tier.rate}</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">Commissie per verkoop</p>
              <p className="text-sm font-medium pt-6 border-t border-current opacity-20">{tier.range}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-40 rounded-[100px] mb-40">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
            {steps.map((step, i) => (
              <div key={i} className="space-y-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl font-black text-[#FF4F00] shadow-sm">
                  {i + 1}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1440px] mx-auto px-6 pb-40 text-center space-y-12">
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">Klaar om te verkopen?</h2>
        <button
          onClick={handleStart}
          className="px-20 py-8 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-[#FF4F00] transition-all"
        >
          Maak een Verkoper-account aan
        </button>
      </section>
    </div>
  );
};

export default SellInfoPage;