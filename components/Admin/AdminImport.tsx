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
  const [csvContent, setCsvContent] = useState('');

  const handleSmartImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;

    // Validação de URL
    if (!importUrl.startsWith('http://') && !importUrl.startsWith('https://')) {
      alert('Ongeldige link. De URL moet beginnen met http:// of https://\n\n(Invalid URL. Must start with http:// or https://)');
      return;
    }
    
    const useAI = !!apiKeys.openRouter;
    setIsImporting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'admin_local';

      // Send the API key explicitly to the Edge Function (can be empty string)
      const { data: aiProduct, error: fnError } = await supabase.functions.invoke('clone-product', {
        body: { 
          url: importUrl,
          apiKey: apiKeys.openRouter 
        }
      });

      if (fnError) throw new Error(fnError.message || 'Import Verbinding Mislukt');
      if (!aiProduct || aiProduct.error) throw new Error(aiProduct?.error || 'Geen data ontvangen.');

      const basePrice = aiProduct.price || 50;
      const finalPrice = basePrice * (1 + (priceMarkup / 100));

      const newProduct = {
        title: aiProduct.title || "Geïmporteerd Item",
        description: aiProduct.description || `Geïmporteerd van: ${importUrl}`,
        price: parseFloat(finalPrice.toFixed(2)),
        category: aiProduct.category || 'Overig',
        condition: ProductCondition.NEW,
        image: aiProduct.image || 'https://via.placeholder.com/800x800?text=No+Image',
        seller_id: userId,
        status: ProductStatus.ACTIVE,
        sku: `DROP-${Date.now()}`,
        created_at: new Date().toISOString(),
        commission_rate: 0.15,
        commission_amount: parseFloat(finalPrice.toFixed(2)) * 0.15,
        shipping_methods: ['postnl']
      };

      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) throw error;

      onImportSuccess();
      setImportUrl('');
      alert(`Product "${newProduct.title}" succesvol geïmporteerd! ${!useAI ? '(Basis Mode)' : '(AI Mode)'}`);
    } catch (err) {
      console.error(err);
      alert('Import Mislukt: ' + (err as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleCSVImport = async () => {
    if (!csvContent) return;
    setIsImporting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'admin_local';

      const lines = csvContent.split('\n');
      const productsToInsert = [];

      for (let line of lines) {
        const [title, price, category, image] = line.split(',');
        if (title && price) {
          productsToInsert.push({
            title: title.trim(),
            price: parseFloat(price.trim()),
            category: category?.trim() || 'Overig',
            image: image?.trim() || 'https://via.placeholder.com/300',
            seller_id: userId,
            condition: ProductCondition.NEW,
            status: ProductStatus.ACTIVE,
            description: 'Geïmporteerd via Bulk CSV',
            sku: `BULK-${Math.floor(Math.random() * 10000)}`,
            created_at: new Date().toISOString(),
            commission_rate: 0.15,
            commission_amount: parseFloat(price.trim()) * 0.15,
            shipping_methods: ['postnl']
          });
        }
      }

      if (productsToInsert.length > 0) {
        const { error } = await supabase.from('products').insert(productsToInsert);
        if (error) throw error;
        onImportSuccess();
        setCsvContent('');
        alert(`${productsToInsert.length} producten succesvol geïmporteerd!`);
      } else {
        alert("Geen geldige producten gevonden in CSV.");
      }
    } catch (err) {
      alert('Fout in CSV: ' + (err as Error).message);
    } finally {
      setIsImporting(false);
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
          {apiKeys.openRouter ? (
             <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded uppercase tracking-widest">AI Actief</span>
          ) : (
             <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-widest">Basis Mode</span>
          )}
        </div>
        
        <p className="text-xs text-slate-500 font-medium">
          Plak een productlink (AliExpress, Temu, Amazon, etc.). 
          {apiKeys.openRouter 
            ? ' De AI zal details, prijs en afbeeldingen intelligent extraheren.' 
            : ' Het systeem zal proberen basisinformatie te scrapen (Titel, Foto).'}
        </p>
        
        <form onSubmit={handleSmartImport} className="space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-3 mb-1 block">Productlink</label>
            <input 
              required 
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              placeholder="https://..." 
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 outline-none" 
            />
          </div>
          
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-3 mb-1 block">Winstmarge (%)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" min="0" max="200" step="5"
                value={priceMarkup}
                onChange={e => setPriceMarkup(Number(e.target.value))}
                className="flex-1 accent-purple-600"
              />
              <span className="font-black text-purple-600 w-12 text-right">{priceMarkup}%</span>
            </div>
          </div>

          <button disabled={isImporting} className="w-full py-4 bg-purple-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-purple-700 transition-all disabled:opacity-50 shadow-xl shadow-purple-500/20">
            {isImporting ? 'Analyseren & Importeren...' : apiKeys.openRouter ? 'Start Smart Clone (AI)' : 'Start Basis Import'}
          </button>
          
          {!apiKeys.openRouter && (
            <p className="text-[9px] text-center text-slate-400 cursor-pointer hover:text-purple-600 transition-colors" onClick={onRequestSettings}>
              Tip: Configureer OpenRouter API voor betere resultaten →
            </p>
          )}
        </form>
      </div>

      {/* Bulk CSV Import */}
      <div className="bg-slate-900 p-10 rounded-[40px] shadow-xl text-white space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 flex items-center justify-center bg-white/10 text-white rounded-full">📊</span>
          <h3 className="text-xl font-black uppercase tracking-tighter">Massa Import (CSV)</h3>
        </div>
        <p className="text-xs text-white/60 font-medium">Plak hier uw CSV-gegevens. Formaat: Titel,Prijs,Categorie,AfbeeldingURL</p>
        
        <textarea 
          value={csvContent}
          onChange={e => setCsvContent(e.target.value)}
          placeholder="iPhone 15, 999, Elektronica, http://img...\nEames Stoel, 450, Design, http://img..."
          className="w-full h-40 bg-white/10 border-none rounded-2xl p-4 text-xs font-mono text-white placeholder:text-white/20 focus:ring-2 focus:ring-emerald-500/50 outline-none"
        />
        
        <button onClick={handleCSVImport} disabled={isImporting} className="w-full py-4 bg-emerald-500 text-slate-900 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/10">
          {isImporting ? 'Verwerken...' : 'CSV Lijst Verwerken'}
        </button>
      </div>
    </div>
  );
};

export default AdminImport;