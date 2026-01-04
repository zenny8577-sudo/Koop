import React, { useState, useEffect } from 'react';
import { Product, ProductCondition, ProductStatus } from '../../types';
import { supabase } from '../../src/integrations/supabase/client';

interface ProductFormProps {
  initialData?: Partial<Product> | any; // Allow any to handle snake_case properties from DB
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const CATEGORY_MAP: Record<string, string[]> = {
  'Elektronica': ['Smartphones', 'Laptops', 'Audio', 'Camera', 'Gaming', 'TV & Home Cinema'],
  'Design': ['Stoelen', 'Tafels', 'Verlichting', 'Kasten', 'Decoratie', 'Banken'],
  'Fietsen': ['Stadsfietsen', 'E-bikes', 'Racefietsen', 'Bakfietsen', 'Kinderfietsen'],
  'Vintage Mode': ['Tassen', 'Kleding', 'Accessoires', 'Schoenen', 'Horloges', 'Sieraden'],
  'Kunst & Antiek': ['Schilderijen', 'Sculpturen', 'Keramiek', 'Klokken', 'Glaswerk'],
  'Gadgets': ['Drones', 'Smart Home', 'Wearables', 'Keuken', '3D Printers']
};

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Elektronica',
    subcategory: '',
    condition: ProductCondition.NEW,
    image: '',
    gallery: [] as string[],
    sku: '',
    // Mapeamento inteligente para ler tanto camelCase quanto snake_case
    originCountry: initialData?.originCountry || initialData?.origin_country || 'NL',
    estimatedDelivery: initialData?.estimatedDelivery || initialData?.estimated_delivery || '1-3 werkdagen',
    ...initialData
  });
  const [keepOpen, setKeepOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (formData.category && !CATEGORY_MAP[formData.category]?.includes(formData.subcategory)) {
      setFormData(prev => ({ ...prev, subcategory: CATEGORY_MAP[formData.category]?.[0] || '' }));
    }
  }, [formData.category]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }

      if (isGallery) {
        setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), ...uploadedUrls] }));
      } else {
        setFormData(prev => ({ ...prev, image: uploadedUrls[0] }));
      }
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Fout bij uploaden afbeelding.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      price: parseFloat(formData.price as string),
      sku: formData.sku || `SKU-${Date.now()}`,
      status: ProductStatus.ACTIVE,
      // Garante que os campos de logística são passados corretamente
      originCountry: formData.originCountry,
      estimatedDelivery: formData.estimatedDelivery
    });

    if (keepOpen) {
      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        price: '',
        image: '',
        gallery: [],
        sku: ''
      }));
      window.scrollTo(0, 0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Basis Informatie */}
      <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Basis Informatie</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Product Titel</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Categorie</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none cursor-pointer dark:text-white"
              >
                {Object.keys(CATEGORY_MAP).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Subcategorie</label>
              <select 
                value={formData.subcategory}
                onChange={e => setFormData({...formData, subcategory: e.target.value})}
                className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none cursor-pointer dark:text-white"
              >
                <option value="">Selecteer...</option>
                {CATEGORY_MAP[formData.category]?.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Omschrijving</label>
          <textarea 
            required
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none h-32 dark:text-white"
          />
        </div>
      </div>

      {/* Logística */}
      <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Logistiek</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Herkomst (Landcode)</label>
              <input 
                value={formData.originCountry}
                onChange={e => setFormData({...formData, originCountry: e.target.value.toUpperCase()})}
                className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none dark:text-white"
                placeholder="NL, CN, DE"
                maxLength={2}
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Levertijd</label>
              <input 
                value={formData.estimatedDelivery}
                onChange={e => setFormData({...formData, estimatedDelivery: e.target.value})}
                className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none dark:text-white"
                placeholder="Bijv. 1-3 werkdagen"
              />
           </div>
        </div>
      </div>

      {/* Prijs & Voorraad */}
      <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Prijs & Voorraad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Prijs (€)</label>
            <input 
              type="number"
              required
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">SKU</label>
            <input 
              value={formData.sku}
              onChange={e => setFormData({...formData, sku: e.target.value})}
              className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Conditie</label>
            <select 
              value={formData.condition}
              onChange={e => setFormData({...formData, condition: e.target.value as ProductCondition})}
              className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none dark:text-white"
            >
              {Object.values(ProductCondition).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Media</h3>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Hoofdafbeelding</label>
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-slate-400 text-center hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                   {isUploading ? 'Uploaden...' : 'Klik om te uploaden of sleep hierheen'}
                </div>
            </div>
            {formData.image ? (
              <img src={formData.image} className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0 bg-white" alt="Preview" />
            ) : (
                <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-center">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Galerij ({formData.gallery?.length || 0})</label>
             <div className="relative">
                <input 
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, true)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-[10px] font-black uppercase text-purple-600 hover:underline cursor-pointer">+ Toevoegen (Selecteer meerdere)</span>
             </div>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-2 min-h-[90px]">
             {formData.gallery?.map((url, i) => (
               <div key={i} className="relative w-20 h-20 shrink-0">
                 <img src={url} className="w-full h-full object-cover rounded-xl" />
                 <button 
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, idx) => idx !== i) }))}
                   className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs shadow-md"
                 >
                   ×
                 </button>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-4 bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-slate-400 font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">Annuleren</button>
        <div className="flex-1 flex gap-4">
            <button type="submit" onClick={() => setKeepOpen(true)} disabled={isLoading || isUploading} className="flex-1 py-4 bg-purple-100 text-purple-700 font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-purple-200 transition-all">Opslaan & Nog een</button>
            <button type="submit" onClick={() => setKeepOpen(false)} disabled={isLoading || isUploading} className="flex-1 py-4 bg-purple-600 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/20">{isLoading ? 'Opslaan...' : 'Publiceren'}</button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;