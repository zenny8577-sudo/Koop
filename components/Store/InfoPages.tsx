
import React from 'react';

interface InfoPageProps {
  type: 'about' | 'faq' | 'contact' | 'privacy' | 'terms';
}

const InfoPages: React.FC<InfoPageProps> = ({ type }) => {
  const content = {
    about: {
      title: 'De Toekomst van Resale.',
      subtitle: 'Over Koop',
      body: (
        <div className="space-y-12">
          <p className="text-2xl font-medium leading-relaxed text-slate-600">
            Koop is ontstaan uit een passie voor hoogwaardig design en technologie. In een wereld van snelle consumptie geloven wij in het verlengen van de levensduur van prachtige objecten.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tighter">Onze Missie</h3>
              <p className="text-slate-500 leading-relaxed">Het bouwen van het meest vertrouwde ecosysteem voor de handel in luxe pre-owned items in Nederland en daarbuiten.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tighter">Echtheid Gegarandeerd</h3>
              <p className="text-slate-500 leading-relaxed">Elk item op ons platform wordt onderworpen aan een strikte controle door onze interne experts voordat het wordt verzonden.</p>
            </div>
          </div>
        </div>
      )
    },
    faq: {
      title: 'Hoe kunnen we helpen?',
      subtitle: 'Veelgestelde Vragen',
      body: (
        <div className="space-y-8">
          {[
            { q: 'Hoe werkt de verzending?', a: 'Wij werken samen met PostNL e DHL voor een veilige en verzekerde verzending binnen Nederland en de EU.' },
            { q: 'Zijn alle producten geverifieerd?', a: 'Ja, elk product met de status "Geverifieerd" is fysiek gecontroleerd door ons team.' },
            { q: 'Wat is de retourperiode?', a: 'Je hebt wettelijk 14 dagen bedenktijd na ontvangst van je item.' },
            { q: 'Hoe word ik een verkoper?', a: 'Meld je aan via de "Verkopen" pagina en wij nemen binnen 24 uur contact met je op.' }
          ].map((item, i) => (
            <div key={i} className="p-10 bg-slate-50 rounded-[40px] space-y-4">
              <h4 className="text-lg font-black uppercase tracking-tighter">{item.q}</h4>
              <p className="text-slate-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      )
    },
    contact: {
      title: 'Laten we praten.',
      subtitle: 'Contact',
      body: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <p className="text-slate-500 text-lg">Heeft u vragen over een specifiek item of wilt u een grote collectie verkopen? Ons team staat klaar.</p>
            <div className="space-y-4">
              <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">E-mail</p>
              <p className="text-2xl font-black text-slate-900">support@koop.nl</p>
            </div>
            <div className="space-y-4">
              <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">Hoofdkantoor</p>
              <p className="text-lg font-bold text-slate-900 leading-relaxed">Keizersgracht 123<br />1015 CJ Amsterdam<br />Nederland</p>
            </div>
          </div>
          <form className="bg-slate-900 p-12 rounded-[60px] space-y-6 shadow-2xl">
            <input type="text" placeholder="NAAM" className="w-full bg-white/5 border-none rounded-2xl px-8 py-5 text-sm font-bold text-white outline-none" />
            <input type="email" placeholder="E-MAIL" className="w-full bg-white/5 border-none rounded-2xl px-8 py-5 text-sm font-bold text-white outline-none" />
            <textarea placeholder="BERICHT" className="w-full bg-white/5 border-none rounded-2xl px-8 py-5 text-sm font-bold text-white outline-none h-40" />
            <button className="w-full py-6 bg-[#FF4F00] text-white font-black rounded-2xl uppercase tracking-widest text-[10px]">Verstuur Bericht</button>
          </form>
        </div>
      )
    },
    privacy: {
      title: 'Uw Gegevens.',
      subtitle: 'Privacy Policy',
      body: (
        <div className="prose prose-slate max-w-none text-slate-500 leading-relaxed space-y-6">
          <p>Bij Koop nemen we uw privacy serieus. Wij gebruiken uw gegevens uitsluitend om de best mogelijke ervaring op ons platform te bieden.</p>
          <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs">1. Gegevensverzameling</h4>
          <p>Wij verzamelen informatie die u verstrekt bij het aanmaken van een account, waaronder naam, e-mailadres en betaalgegevens via Stripe.</p>
          <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs">2. Beveiliging</h4>
          <p>Alle data wordt versleuteld verzonden en opgeslagen volgens de hoogste industriestandaarden (GDPR/AVG compliant).</p>
        </div>
      )
    },
    terms: {
      title: 'De Regels.',
      subtitle: 'Voorwaarden',
      body: (
        <div className="prose prose-slate max-w-none text-slate-500 leading-relaxed space-y-6">
          <p>Door gebruik te maken van Koop gaat u akkoord met de volgende voorwaarden.</p>
          <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs">1. Gebruik van het platform</h4>
          <p>Het platform is bedoeld voor de handel in authentieke, pre-owned goederen.</p>
          <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs">2. Commissies</h4>
          <p>Onze commissies variëren tussen de 8% e 15%, afhankelijk van de waarde van het item.</p>
        </div>
      )
    }
  };

  const activePage = content[type] || content.about;

  return (
    <div className="max-w-7xl mx-auto px-6 py-32 lg:py-48 animate-fadeIn">
      <div className="max-w-4xl space-y-12">
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">{activePage.subtitle}</span>
          <h1 className="text-6xl lg:text-[100px] font-black text-slate-900 tracking-tighter leading-[0.85] uppercase">{activePage.title}</h1>
        </div>
        <div className="pt-20 border-t border-slate-100">
          {activePage.body}
        </div>
      </div>
    </div>
  );
};

export default InfoPages;
