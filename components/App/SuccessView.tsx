import React from 'react';

interface SuccessViewProps {
  onNavigate: (view: string) => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({ onNavigate }) => {
  React.useEffect(() => {
    console.log('SuccessView mounted - checkout completed');
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
      <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-xl mb-14">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </div>
      <h2 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase mb-8">Succes!</h2>
      <p className="text-slate-500 max-w-sm mx-auto font-medium text-lg mb-16 uppercase tracking-widest">Je bestelling wordt verwerkt.</p>
      <div className="flex gap-4">
        <button onClick={() => onNavigate('home')} className="px-16 py-8 bg-white border-2 border-slate-950 text-slate-950 font-black rounded-full uppercase tracking-widest text-[12px] hover:bg-slate-950 hover:text-white transition-all">Terug naar Home</button>
        <button onClick={() => onNavigate('buyer-dashboard')} className="px-16 py-8 bg-slate-950 text-white font-black rounded-full uppercase tracking-widest text-[12px] hover:bg-[#FF4F00] transition-all shadow-2xl">Bekijk Bestelling</button>
      </div>
    </div>
  );
};

export default SuccessView;