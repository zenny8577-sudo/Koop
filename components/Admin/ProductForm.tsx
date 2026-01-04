import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductCondition, ProductStatus } from '../../types';
import { supabase } from '../../src/integrations/supabase/client';

interface ProductFormProps {
  initialData?: Partial<Product> | any;
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
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price !== undefined ? initialData.price.toString() : '',
    category: initialData?.category || 'Elektronica',
    subcategory: initialData?.subcategory || '',
    condition: initialData?.condition || ProductCondition.NEW,
    image: initialData?.image || '',
    gallery: initialData?.gallery || [],
    sku: initialData?.sku || '',
    originCountry: initialData?.originCountry || initialData?.origin_country || 'NL',
    estimatedDelivery: initialData?.estimatedDelivery || initialData?.estimated_delivery || '1-3 werkdagen',
    ...initialData
  });
  
  const [keepOpen, setKeepOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');

  useEffect(() => {
    if (formData.category && !CATEGORY_MAP[formData.category]?.includes(formData.subcategory)) {
      const validSubs = CATEGORY_MAP[formData.category] || [];
      if (validSubs.length > 0 && !validSubs.includes(formData.subcategory)) {
         setFormData(prev => ({ ...prev, subcategory: validSubs[0] }));
      }
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
        const safeName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(safeName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(safeName);
        
        uploadedUrls.push(publicUrl);
      }

      if (isGallery) {
        setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), ...uploadedUrls] }));
      } else {
        setFormData(prev => ({ ...prev, image: uploadedUrls[0] }));
      }
    } catch (error) {
      console.error('Upload Failed:', error);
      alert('Upload mislukt. Controleer uw verbinding en bestandsgrootte.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddGalleryUrl = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault(); // Impede submit do form
    
    if (!galleryUrlInput || galleryUrlInput.trim().length < 5) return;
    
    setFormData(prev => ({ 
      ...prev, 
      gallery: [...(prev.gallery || []), galleryUrlInput.trim()] 
    }));
    setGalleryUrlInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading || isLoading) return;

    try {
      let rawPrice = formData.price.toString().replace(',', '.').replace(/[^0-9.]/g, '');
      const parsedPrice = parseFloat(rawPrice);

      if (isNaN(parsedPrice) || parsedPrice < 0) {
        alert("Voer een geldige prijs in.");
        return;
      }

      if (!formData.title) {
        alert("Titel is verplicht.");
        return;
      }

      // Sanitização da galeria: Remove duplicatas e strings vazias
      const cleanGallery = [...new Set((formData.gallery || [])
        .map((url: string) => url?.trim())
        .filter((url: string) => url && url.length > 5))];

      const finalImage = formData.image || (cleanGallery.length > 0 ? cleanGallery[0] : 'https://via.placeholder.com/800?text=No+Image');

      await onSubmit({
        ...formData,
        price: parsedPrice,
        sku: formData.sku || `SKU-${Date.now()}`,
        status: ProductStatus.ACTIVE,
        image: finalImage,
        gallery: cleanGallery,
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
    } catch (error) {
      console.error("Form submit error:", error);
      alert("Er ging iets mis bij het voorbereiden van de gegevens: " + (error as Error).message);
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

      {/* Logistiek */}
      <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Logistiek</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Herkomst (Landcode)</label>
              <input 
                value={formData.originCountry}
                onChange={e => setFormData({...formData, originCountry: e.target.value.toUpperCase()})}
                className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none dark:text-white"
                placeholder="NL"
                maxLength={2}
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Levertijd</label>
              <input 
                value={formData.estimatedDelivery}
                onChange={e => setFormData({...formData, estimatedDelivery: e.target.value})}
                className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none dark:text-white"
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
              type="text"
              required
              placeholder="0.00"
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
        
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Hoofdafbeelding</label>
          <div className="flex gap-4 items-center">
              <div className="flex-1 relative group">
                  <input 
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={(e) => handleImageUpload(e, false)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                  />
                  <div className={`w-full bg-white dark:bg-white/5 border-2 border-dashed ${isUploading ? 'border-[#FF4F00]' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-6 py-4 text-sm font-bold text-slate-400 text-center hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 h-20`}>
                      {isUploading ? 'Bezig met uploaden...' : formData.image ? 'Klik om te wijzigen' : 'Upload Coverfoto'}
                  </div>
              </div>
              {formData.image && (
                <img src={formData.image} className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0 bg-white" alt="Preview" />
              )}
          </div>
          <input 
              placeholder="Of plak afbeeldings-URL..." 
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
              className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-xs font-bold outline-none dark:text-white text-slate-400"
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
           <div className="flex justify-between items-center">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Galerij ({formData.gallery?.length || 0} extra foto's)</label>
           </div>
           
           <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                  <input 
                      placeholder="Plak URL en druk op +" 
                      value={galleryUrlInput}
                      onChange={e => setGalleryUrlInput(e.target.value)}
                      className="flex-1 bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none dark:text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddGalleryUrl();
                        }
                      }}
                  />
                  <button 
                      type="button"
                      onClick={(e) => handleAddGalleryUrl(e)}
                      className="px-6 py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#FF4F00] transition-colors"
                  >
                      +
                  </button>
              </div>

              <div className="relative">
                  <input 
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploading}
                      onChange={(e) => handleImageUpload(e, true)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                  />
                  <div className={`w-full bg-white dark:bg-white/5 border-2 border-dashed ${isUploading ? 'border-[#FF4F00]' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-6 py-4 text-sm font-bold text-slate-400 text-center hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2`}>
                      <span className="text-2xl mr-2">📸</span>
                      {isUploading ? 'Uploaden...' : 'Klik hier om MEERDERE foto\'s te selecteren'}
                  </div>
              </div>
           </div>

           {formData.gallery && formData.gallery.length > 0 && (
             <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
               {formData.gallery.map((url: string, i: number) => (
                 <div key={i} className="relative w-24 h-24 shrink-0 group">
                   <img src={url} className="w-full h-full object-cover rounded-xl border border-slate-100 bg-white" />
                   <button 
                     type="button"
                     onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, idx) => idx !== i) }))}
                     className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs shadow-md opacity-100 hover:bg-rose-600 transition-all cursor-pointer z-10"
                   >
                     ×
                   </button>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 py-4 bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-slate-400 font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">ANNULEREN</button>
        <div className="flex-1 flex gap-4">
            <button type="submit" onClick={() => setKeepOpen(true)} disabled={isLoading || isUploading} className="flex-1 py-4 bg-purple-100 text-purple-700 font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-purple-200 transition-all disabled:opacity-50">OPSLAAN & NOG EEN</button>
            <button type="submit" onClick={() => setKeepOpen(false)} disabled={isLoading || isUploading} className="flex-1 py-4 bg-purple-600 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50">{isLoading ? 'BEZIG...' : 'PUBLICEREN'}</button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;