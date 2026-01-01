
import React, { useState } from 'react';
import { ICONS } from '../../constants';

const ImportForm: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsImporting(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsImporting(false), 500);
      }
    }, 100);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#96588a] rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current"><path d="M22.5,12A10.5,10.5 0 0,1 12,22.5A10.5,10.5 0 0,1 1.5,12A10.5,10.5 0 0,1 12,1.5A10.5,10.5 0 0,1 22.5,12M20.25,12A8.25,8.25 0 0,0 12,3.75A8.25,8.25 0 0,0 3.75,12A8.25,8.25 0 0,0 12,20.25A8.25,8.25 0 0,0 20.25,12M7.5,13.5H16.5V15H7.5V13.5M7.5,10.5H16.5V12H7.5V10.5M7.5,7.5H16.5V9H7.5V7.5Z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">WooCommerce Sync</h2>
              <p className="text-slate-400 text-sm">Importeer je bestaande producten direct naar Koop.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleImport} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Store URL</label>
              <input 
                type="url" 
                placeholder="https://jouwshop.nl"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Consumer Key</label>
              <input 
                type="password" 
                placeholder="ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Consumer Secret</label>
              <input 
                type="password" 
                placeholder="cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3">
             <div className="text-orange-500 shrink-0">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <p className="text-xs text-orange-800 leading-relaxed">
               Wij syncen automatisch je voorraad en prijzen. Commissies worden berekend op basis van je huidige verkoperstier.
             </p>
          </div>

          <button 
            type="submit"
            disabled={isImporting}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${isImporting ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#FF4F00] hover:bg-[#E04600] shadow-orange-500/20'}`}
          >
            {isImporting ? `Synchroniseren... ${progress}%` : 'Start Import'}
          </button>

          {isImporting && (
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#FF4F00] h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </form>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-white rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 mb-1">Items Gedetecteerd</p>
          <p className="text-xl font-bold text-slate-900">1.250+</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 mb-1">Gem. Tijd</p>
          <p className="text-xl font-bold text-slate-900">&lt; 2 min</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 mb-1">Succes Ratio</p>
          <p className="text-xl font-bold text-emerald-600">99.8%</p>
        </div>
      </div>
    </div>
  );
};

export default ImportForm;
