import React, { useState, useEffect, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watchdog para timeout de importação
  useEffect(() => {
    let watchdog: any;
    if (isImporting) {
      watchdog = setTimeout(() => {
        if (isImporting) {
          setIsImporting(false);
          setStatusMsg('');
          alert('Time-out: De server reageerde niet. We stoppen het proces.');
        }
      }, 15000);
    }
    return () => clearTimeout(watchdog);
  }, [isImporting]);

  const handleDownloadTemplate = () => {
    const headers = [
      'Title',
      'Description',
      'Price',
      'Category',
      'Subcategory',
      'Condition (NEW/LIKE_NEW/GOOD/FAIR)',
      'Image_URL',
      'SKU',
      'Origin_Country (NL/DE/CN)',
      'Delivery_Time'
    ];

    const exampleRow = [
      'iPhone 15 Pro',
      'Gloednieuw in doos met garantie',
      '999.00',
      'Elektronica',
      'Smartphones',
      'NEW',
      'https://example.com/iphone.jpg',
      'IP15-PRO-BLK',
      'NL',
      '1-2 werkdagen'
    ];

    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'koop_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Processador simples de CSV
  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const result = [];
    // Pula cabeçalho (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Tratamento básico para vírgulas dentro de aspas seria ideal, 
      // mas para este template simples vamos dividir por vírgula.
      // Usuários devem evitar vírgulas nas descrições ou usar um editor de CSV que trate aspas.
      const cols = line.split(','); 
      
      if (cols.length < 3) continue; // Pula linhas inválidas

      result.push({
        title: cols[0]?.trim() || 'Geïmporteerd Item',
        description: cols[1]?.trim() || '',
        price: parseFloat(cols[2]?.trim()) || 0,
        category: cols[3]?.trim() || 'Overig',
        subcategory: cols[4]?.trim() || '',
        condition: (cols[5]?.trim() as ProductCondition) || ProductCondition.GOOD,
        image: cols[6]?.trim() || 'https://via.placeholder.com/800',
        sku: cols[7]?.trim() || `CSV-${Date.now()}-${i}`,
        origin: cols[8]?.trim() || 'NL',
        delivery: cols[9]?.trim() || '3-5 dagen'
      });
    }
    return result;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatusMsg('CSV analyseren...');

    try {
      const text = await file.text();
      const products = parseCSV(text);
      
      if (products.length === 0) throw new Error("Geen geldige producten gevonden in CSV.");

      setStatusMsg(`${products.length} producten opslaan...`);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Log in a.u.b.");

      const inserts = products.map(p => ({
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        subcategory: p.subcategory,
        condition: Object.values(ProductCondition).includes(p.condition) ? p.condition : ProductCondition.GOOD,
        image: p.image,
        gallery: [p.image],
        seller_id: user.id,
        status: ProductStatus.ACTIVE,
        sku: p.sku,
        commission_rate: 0.15,
        commission_amount: p.price * 0.15,
        shipping_methods: ['postnl'],
        origin_country: p.origin,
        estimated_delivery: p.delivery,
        is_3d_model: false,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('products').insert(inserts);
      if (error) throw error;

      alert(`Succes! ${products.length} producten toegevoegd.`);
      onImportSuccess();
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      console.error(err);
      alert('CSV Import Fout: ' + (err as Error).message);
    } finally {
      setIsImporting(false);
      setStatusMsg('');
    }
  };

  const handleSmartImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;

    // Validação básica
    if (!importUrl.startsWith('http')) {
      alert('Ongeldige URL');
      return;
    }
    
    setIsImporting(true);
    setStatusMsg('Verbinding maken...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessie verlopen.");

      // Circuit Breaker: Timeout de 5s no client-side
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("TIMEOUT")), 5000)
      );

      let productData: any = null;

      try {
        // Tenta pegar dados via Edge Function
        const response: any = await Promise.race([
          supabase.functions.invoke('clone-product', {
            body: { url: importUrl, apiKey: apiKeys.openRouter }
          }),
          timeoutPromise
        ]);

        if (response.error) throw response.error;
        productData = response.data;
      } catch (err) {
        console.warn("Smart Import fallback active:", err);
        // Fallback robusto: cria item básico se falhar
        productData = {
          title: "Geïmporteerd Item (Concept)",
          description: `Link: ${importUrl}`,
          price: 0,
          category: 'Elektronica',
          image: 'https://via.placeholder.com/800?text=Check+Link',
          scraped_successfully: false
        };
      }

      // Prepara dados finais
      const finalPrice = (productData.price || 0) * (1 + (priceMarkup / 100));

      const newProduct = {
        title: productData.title || "Nieuw Item",
        description: productData.description || `Import: ${importUrl}`,
        price: parseFloat(finalPrice.toFixed(2)),
        category: productData.category || 'Elektronica',
        condition: ProductCondition.NEW,
        image: productData.image || 'https://via.placeholder.com/800',
        gallery: productData.gallery || [productData.image],
        seller_id: user.id,
        status: ProductStatus.ACTIVE,
        sku: `IMP-${Date.now().toString().slice(-6)}`,
        commission_rate: 0.15,
        commission_amount: parseFloat((finalPrice * 0.15).toFixed(2)),
        shipping_methods: ['postnl'],
        origin_country: 'CN',
        estimated_delivery: '7-14 dagen',
        is_3d_model: false,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) throw error;

      onImportSuccess();
      setImportUrl('');
      
      if (productData.scraped_successfully === false) {
        alert('Site beveiligd: Er is een basisconcept aangemaakt. U kunt nu de details bewerken.');
      } else {
        alert('Product succesvol geïmporteerd!');
      }

    } catch (err) {
      alert('Import fout: ' + (err as Error).message);
    } finally {
      setIsImporting(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
      {/* Smart/Basic Import Card */}
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 flex items-center justify-center bg-purple-50 text-purple-600 rounded-full">⚡</span>
            <h3 className="text-xl font-black uppercase tracking-tighter">Directe Import</h3>
          </div>
          <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-widest">
            {apiKeys.openRouter ? 'AI + Basic' : 'Basic Mode'}
          </span>
        </div>
        
        <p className="text-xs text-slate-500 font-medium">
          Werkt met AliExpress, Temu, Amazon. Als de site beveiligd is, maken we direct een concept aan.
        </p>
        
        <form onSubmit={handleSmartImport} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-3">Product URL</label>
            <input 
              required 
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              placeholder="https://..." 
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 outline-none" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-3">Winstmarge</label>
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
      
      {/* CSV Bulk Import Card */}
      <div className="bg-slate-900 p-10 rounded-[40px] shadow-xl text-white space-y-8 flex flex-col justify-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         
         <div className="relative z-10 space-y-4">
           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📦</div>
           <h3 className="text-2xl font-black uppercase tracking-tighter">Bulk Import?</h3>
           <p className="text-white/60 text-sm font-medium leading-relaxed">
             Importeer honderden producten tegelijk via CSV.
           </p>
         </div>
         
         <div className="relative z-10 grid grid-cols-2 gap-4">
            <button 
              onClick={handleDownloadTemplate}
              className="py-4 bg-white/10 text-white font-black rounded-2xl uppercase tracking-widest text-[9px] hover:bg-white/20 transition-all border border-white/5"
            >
              1. Download Template
            </button>
            <label className="py-4 bg-white text-slate-900 font-black rounded-2xl uppercase tracking-widest text-[9px] hover:bg-slate-200 transition-all cursor-pointer flex items-center justify-center text-center">
              {isImporting ? 'Bezig...' : '2. Upload CSV'}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isImporting}
              />
            </label>
         </div>
      </div>
    </div>
  );
};

export default AdminImport;