6s, automatically failover to local creation so the user never gets stuck.">
import React, { useState } from 'react';
import { supabase } from '../../src/integrations/supabase/client';
import { ProductCondition, ProductStatus } from '../../types';

interface AdminImportProps {
  apiKeys: { openRouter: string };
  onImportSuccess: () => void;
  onRequestSettings: () => void;
}

const AdminImport: React.FC<AdminImportProps> = ({ apiKeys, onImportSuccess, onRequestSettings }) => {
  const [importUrl, setImportUrl] = useState('');
  const [priceMarkup, setPriceMarkup] = useState(20);
  const [isImporting, setIsImporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSmartImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;

    if (!importUrl.startsWith('http')) {
      alert('Voer een geldige URL in (http/https).');
      return;
    }
    
    setIsImporting(true);
    setStatusMsg('Verbinding maken met server...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessie verlopen.");

      // --- ENGENHARIA DE SOFTWARE: CIRCUIT BREAKER ---
      // Criamos uma promessa de timeout que rejeita após 6 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("TIMEOUT")), 6000)
      );

      let aiProduct: any = null;

      try {
        // Corrida: Quem responder primeiro ganha (API ou Timeout)
        const response: any = await Promise.race([
          supabase.functions.invoke('clone-product', {
            body: { url: importUrl, apiKey: apiKeys.openRouter }
          }),
          timeoutPromise
        ]);

        if (response.error) throw response.error;
        aiProduct = response.data;
      
      } catch (err) {
        console.warn("Smart Import falhou ou demorou, usando fallback local:", err);
        // Se falhar (timeout ou erro), criamos um objeto padrão
        // Isso garante que o fluxo NUNCA trave
        aiProduct = {
          title: "Concept Item (Bewerk mij)",
          description: `Automatische import van: ${importUrl}. De bronsite reageerde traag, dus vul de details handmatig aan.`,
          price: 0,
          category: 'Overig',
          image: 'https://via.placeholder.com/800x800?text=Upload+Foto',
          gallery: [],
          scraped_successfully: false
        };
        setStatusMsg('Site beveiligd. Concept aanmaken...');
      }

      // --- PREPARAÇÃO DOS DADOS ---
      const basePrice = typeof aiProduct?.price === 'number' ? aiProduct.price : 0;
      const safePrice = basePrice > 0 ? basePrice : 0; // Se for 0, usuário edita depois
      const finalPrice = safePrice > 0 ? safePrice * (1 + (priceMarkup / 100)) : 0;

      const newProductPayload = {
        title: aiProduct?.title || "Nieuw Geïmporteerd Item",
        description: aiProduct?.description || `Import URL: ${importUrl}`,
        price: parseFloat(finalPrice.toFixed(2)),
        category: aiProduct?.category || 'Elektronica',
        condition: ProductCondition.NEW,
        image: aiProduct?.image || 'https://via.placeholder.com/800?text=No+Image',
        gallery: (aiProduct?.gallery && aiProduct.gallery.length) ? aiProduct.gallery : [aiProduct?.image || 'https://via.placeholder.com/800'],
        seller_id: user.id,
        status: ProductStatus.ACTIVE, // Cria como ativo para aparecer na lista, ou PENDING
        sku: `IMP-${Date.now().toString().slice(-6)}`,
        
        // Dados obrigatórios do DB (snake_case)
        commission_rate: 0.15,
        commission_amount: parseFloat((finalPrice * 0.15).toFixed(2)),
        shipping_methods: ['postnl'],
        origin_country: 'CN', 
        estimated_delivery: '7-14 dagen',
        is_3d_model: false,
        created_at: new Date().toISOString()
      };

      // --- INSERÇÃO NO BANCO ---
      const { error: dbError } = await supabase.from('products').insert([newProductPayload]);
      
      if (dbError) throw dbError;

      onImportSuccess();
      setImportUrl('');
      
      // Feedback inteligente
      if (aiProduct.scraped_successfully === false) {
        alert('Product aangemaakt als CONCEPT.\n\nDe doelsite was te traag of beveiligd. We hebben een basisitem aangemaakt dat u nu kunt bewerken.');
      } else {
        alert('Succesvol geïmporteerd!');
      }

    } catch (err) {
      console.error(err);
      alert('Ernstige fout: ' + (err as Error).message);
    } finally {
      setIsImporting(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 flex items-center justify-center bg-purple-50 text-purple-600 rounded-full">⚡</span>
            <h3 className="text-xl font-black uppercase tracking-tighter">Smart Clone</h3>
          </div>
          <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest ${apiKeys.openRouter ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            {apiKeys.openRouter ? 'AI Actief' : 'Scraper Mode'}
          </span>
        </div>
        
        <p className="text-xs text-slate-500 font-medium">
          Plak een URL. Als het te lang duurt, maken we direct een concept aan zodat u door kunt.
        </p>
        
        <form onSubmit={handleSmartImport} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-3">Productlink</label>
            <input 
              required 
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              placeholder="https://..." 
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 outline-none" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-3">Marge</label>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
              <input 
                type="range" min="0" max="200" step="5"
                value={priceMarkup}
                onChange={e => setPriceMarkup(Number(e.target.value))}
                className="flex-1 accent-purple-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-black text-purple-600 text-sm">+{priceMarkup}%</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isImporting} 
            className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-purple-700 transition-all disabled:opacity-50 shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            {isImporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {statusMsg || 'Even geduld...'}
              </>
            ) : 'Start Import'}
          </button>
        </form>
      </div>
      
      <div className="bg-slate-900 p-10 rounded-[40px] shadow-xl text-white space-y-8 flex flex-col justify-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         <div className="relative z-10 space-y-4">
           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📦</div>
           <h3 className="text-2xl font-black uppercase tracking-tighter">Bulk Import?</h3>
           <p className="text-white/60 text-sm font-medium leading-relaxed">Gebruik onze CSV-template.</p>
         </div>
         <button className="relative z-10 w-full py-4 bg-white/10 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all border border-white/5">Download Template</button>
      </div>
    </div>
  );
};

export default AdminImport;