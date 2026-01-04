import React, { useState } from 'react';
import { Product, ProductCondition, ProductStatus } from '../../types';
import { supabase } from '../../src/integrations/supabase/client';

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Elektronica',
    condition: ProductCondition.NEW,
    image: '',
    gallery: [] as string[],
    sku: '',
    stock: 1,
    ...initialData
  });
  const [keepOpen, setKeepOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Upload Function
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Create a local preview URL first (fast feedback)
      const localPreviewUrl = URL.createObjectURL(file);
      
      // 2. Try to upload to Supabase Storage (requires 'products' bucket)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products') // Assuming this bucket exists
        .upload(filePath, file);

      let finalUrl = localPreviewUrl;

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        finalUrl = publicUrl;
      } else {
        console.warn("Upload falhou (bucket pode não existir). Usando preview local.", uploadError);
      }

      if (isGallery) {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, finalUrl] }));
      } else {
        setFormData(prev => ({ ...prev, image: finalUrl }));
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
      status: ProductStatus.ACTIVE
    });

    if (keepOpen) {
      // Reset critical fields but keep category/condition for speed
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
      <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Basis Informatie</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Product Titel</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none"
              placeholder="Bijv. iPhone 15 Pro Max"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Categorie</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none cursor-pointer"
            >
              {['Elektronica', 'Design', 'Fietsen', 'Antiek', 'Gadgets', 'Mode'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Omschrijving</label>
          <textarea 
            required
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none h-32"
            placeholder="Beschrijf het product gedetailleerd..."
          />
        </div>
      </div>

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
              className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none"
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">SKU (Optioneel)</label>
            <input 
              value={formData.sku}
              onChange={e => setFormData({...formData, sku: e.target.value})}
              className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none"
              placeholder="AUTO-GEN"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Conditie</label>
            <select 
              value={formData.condition}
              onChange={e => setFormData({...formData, condition: e.target.value as ProductCondition})}
              className="w-full bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none"
            >
              {Object.values(ProductCondition).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

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
                <div className="w-full bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-slate-400 text-center hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                   {isUploading ? 'Uploaden...' : 'Klik om te uploaden of sleep hierheen'}
                </div>
            </div>
            {formData.image ? (
              <img src={formData.image} className="w-20 h-20 rounded-xl object-cover border border-slate-200" alt="Preview" />
            ) : (
                <input 
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  className="flex-1 bg-white dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                  placeholder="Of plak URL..."
                />
            )}
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-center">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Galerij ({formData.gallery.length})</label>
             <div className="relative">
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-[10px] font-black uppercase text-purple-600 hover:underline cursor-pointer">+ Toevoegen</span>
             </div>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-2">
             {formData.gallery.map((url, i) => (
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
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-4 bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-slate-400 font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          Annuleren
        </button>
        
        <div className="flex-1 flex gap-4">
            <button 
            type="submit" 
            onClick={() => setKeepOpen(true)}
            disabled={isLoading || isUploading}
            className="flex-1 py-4 bg-purple-100 text-purple-700 font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-purple-200 transition-all"
            >
            Opslaan & Nog een
            </button>
            <button 
            type="submit" 
            onClick={() => setKeepOpen(false)}
            disabled={isLoading || isUploading}
            className="flex-1 py-4 bg-purple-600 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/20"
            >
            {isLoading ? 'Opslaan...' : 'Publiceren'}
            </button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;