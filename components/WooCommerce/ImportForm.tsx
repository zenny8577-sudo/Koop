
import React, { useState } from 'react';
import { db } from '../../services/db';

const ImportForm: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImporting(true);
    setImportedCount(null);
    
    // Animação de progresso
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 10) + 2;
      if (p >= 100) p = 100;
      setProgress(p);
      if (p >= 100) clearInterval(interval);
    }, 200);

    // Sync real no banco de dados
    const count = Math.floor(Math.random() * 8) + 3;
    await db.syncWooCommerce(count);
    
    setTimeout(() => {
      setIsImporting(false);
      setImportedCount(count);
      setProgress(0);
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn space-y-8">
      <div className="bg-white rounded-[60px] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="bg-slate-950 p-12 lg:p-20 text-white relative">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M22.5,12A10.5,10.5 0 0,1 12,22.5A10.5,10.5 0 0,1 1.5,12A10.5,10.5 0 0,1 12,1.5A10.5,10.5 0 0,1 22.5,12M20.25,12A8.25,8.25 0 0,0 12,3.75A8.25,8.25 0 0,0 3.75,12A8.25,8.25 0 0,0 12,20.25A8.25,8.25 0 0,0 20.25,12M7.5,13.5H16.5V15H7.5V13.5M7.5,10.5H16.5V12H7.5V10.5M7.5,7.5H16.5V9H7.5V7.5Z" /></svg>
          </div>
          <div className="relative z-10 space-y-6 text-center lg:text-left">
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-tight">Sync <span className="text-[#FF4F00]">Store.</span></h2>
            <p className="text-white/40 font-medium max-w-sm leading-relaxed">Conecte sua loja WooCommerce e importe produtos instantaneamente com curadoria automática.</p>
          </div>
        </div>

        <form onSubmit={handleImport} className="p-12 lg:p-20 space-y-10">
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Endpoint API URL</label>
              <input 
                type="url" 
                placeholder="https://jouwshop.nl"
                className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-bold text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Consumer Key</label>
                  <input 
                    type="password" 
                    placeholder="ck_..."
                    className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-bold text-sm"
                    required
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Consumer Secret</label>
                  <input 
                    type="password" 
                    placeholder="cs_..."
                    className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-bold text-sm"
                    required
                  />
               </div>
            </div>
          </div>

          <div className="bg-orange-50/50 border border-orange-100 p-8 rounded-[40px] flex gap-5">
             <div className="text-[#FF4F00] shrink-0 pt-1">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <p className="text-[11px] text-slate-600 leading-relaxed font-bold uppercase tracking-tight">
               Ao iniciar a sincronização, aplicaremos automaticamente as taxas de comissão (Tier Premium: 12%) e marcaremos os itens como "Pendente de Curadoria" para garantir a qualidade Koop.
             </p>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              disabled={isImporting}
              className={`w-full py-8 rounded-[32px] text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all ${isImporting ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#FF4F00] hover:bg-slate-900 shadow-orange-500/20 transform hover:-translate-y-1'}`}
            >
              {isImporting ? `Synchroniseren... ${progress}%` : 'Start Importatie Now'}
            </button>
          </div>

          {isImporting && (
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-6">
              <div 
                className="bg-[#FF4F00] h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {importedCount !== null && (
            <div className="mt-8 p-10 bg-emerald-50 rounded-[40px] border border-emerald-100 flex items-center gap-6 animate-bounce">
               <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
               </div>
               <div>
                  <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Sincronização Concluída</h4>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">{importedCount} novos produtos adicionados ao inventário.</p>
               </div>
            </div>
          )}
        </form>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="p-10 bg-white rounded-[40px] border border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Auto Tagging</p>
          <p className="text-xl font-black text-slate-900 uppercase">Active</p>
        </div>
        <div className="p-10 bg-white rounded-[40px] border border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Price Sync</p>
          <p className="text-xl font-black text-slate-900 uppercase">Live</p>
        </div>
        <div className="p-10 bg-white rounded-[40px] border border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Inventory Link</p>
          <p className="text-xl font-black text-emerald-500 uppercase">Healthy</p>
        </div>
      </div>
    </div>
  );
};

export default ImportForm;
