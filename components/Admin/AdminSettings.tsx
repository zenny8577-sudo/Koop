import React from 'react';

interface AdminSettingsProps {
  apiKeys: { openRouter: string; stripe: string };
  setApiKeys: (keys: { openRouter: string; stripe: string }) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ apiKeys, setApiKeys }) => {
  const handleSaveSettings = () => {
    localStorage.setItem('koop_openrouter_key', apiKeys.openRouter);
    localStorage.setItem('koop_stripe_key', apiKeys.stripe);
    alert('Instellingen opgeslagen!');
  };

  return (
    <div className="bg-white p-10 rounded-[40px] border border-slate-100 max-w-2xl animate-fadeIn">
      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8">Systeem Instellingen</h3>
      
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">OpenRouter API Key (AI Import)</label>
            {apiKeys.openRouter ? (
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Verbonden</span>
            ) : (
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded">Niet Verbonden</span>
            )}
          </div>
          <input 
            type="password"
            value={apiKeys.openRouter}
            onChange={e => setApiKeys({...apiKeys, openRouter: e.target.value})}
            placeholder="sk-or-v1-..."
            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-mono outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <p className="text-[10px] text-slate-400">Nodig voor de 'Smart Clone' functie in het import tabblad.</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Stripe Secret Key (Betalingen)</label>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Binnenkort</span>
          </div>
          <input 
            disabled
            placeholder="sk_test_..."
            className="w-full bg-slate-50/50 border-none rounded-2xl px-6 py-4 text-sm font-mono outline-none cursor-not-allowed opacity-50"
          />
        </div>

        <div className="pt-4">
          <button 
            onClick={handleSaveSettings}
            className="px-8 py-4 bg-purple-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-purple-700 transition-all shadow-xl"
          >
            Instellingen Opslaan
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;