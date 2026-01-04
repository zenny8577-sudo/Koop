import React, { useState, useEffect } from 'react';
import { Product, ProductCondition, ProductStatus } from '../../types';

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

  // Helper para adicionar imagem à galeria
  const addGalleryImage = () => {
    const url = prompt('URL da imagem:');
    if (url) {
      setFormData(prev => ({ ...prev, gallery: [...prev.gallery, url] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price as string),
      // Auto-generate fields if missing
      sku: formData.sku || `SKU-${Date.now()}`,
      status: ProductStatus.ACTIVE // Admins create active products directly
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Basis Informatie</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Product Titel</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-purple-500/10 outline-none"
              placeholder="Bijv. iPhone 15 Pro Max"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Categorie</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-purple-500/10 outline-none"
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
            className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-purple-500/10 outline-none h-32"
            placeholder="Beschrijf het product gedetailleerd..."
          />
        </div>
      </div>

      <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Prijs & Voorraad</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Prijs (€)</label>
            <input 
              type="number"
              required
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-purple-500/10 outline-none"
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">SKU (Optioneel)</label>
            <input 
              value={formData.sku}
              onChange={e => setFormData({...formData, sku: e.target.value})}
              className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-purple-500/10 outline-none"
              placeholder="AUTO-GEN"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Conditie</label>
            <select 
              value={formData.condition}
              onChange={e => setFormData({...formData, condition: e.target.value as ProductCondition})}
              className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-purple-500/10 outline-none"
            >
              {Object.values(ProductCondition).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Media</h3>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Hoofdafbeelding URL</label>
          <div className="flex gap-4">
            <input 
              required
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
              className="flex-1 bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-purple-500/10 outline-none"
              placeholder="https://..."
            />
            {formData.image && (
              <img src={formData.image} className="w-14 h-14 rounded-xl object-cover border border-slate-200" alt="Preview" />
            )}
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-center">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Galerij ({formData.gallery.length})</label>
             <button type="button" onClick={addGalleryImage} className="text-[10px] font-black uppercase text-purple-600 hover:underline">+ Toevoegen</button>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-2">
             {formData.gallery.map((url, i) => (
               <div key={i} className="relative w-20 h-20 shrink-0">
                 <img src={url} className="w-full h-full object-cover rounded-xl" />
                 <button 
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, idx) => idx !== i) }))}
                   className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs"
                 >
                   ×
                 </button>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-400 font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          Annuleren
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="flex-1 py-4 bg-purple-600 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/20"
        >
          {isLoading ? 'Opslaan...' : 'Product Publiceren'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;