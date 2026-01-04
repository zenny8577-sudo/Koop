import React from 'react';
import ProductCard from '../Products/ProductCard';
import { Product } from '../../types';

interface ShopViewProps {
  products: Product[];
  filters: any;
  user: any;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onFilterChange: (filters: any) => void;
  onResetFilters: () => void;
  onRemoveFilter: (key: string) => void;
}

const ShopView: React.FC<ShopViewProps> = ({
  products,
  filters,
  user,
  onViewProduct,
  onAddToCart,
  onToggleWishlist,
  onFilterChange,
  onResetFilters,
  onRemoveFilter
}) => {
  const categoryImages: Record<string, string> = {
    'Elektronica': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200',
    'Design': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200',
    'Fietsen': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=1200',
    'Antiek': 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=1200',
    'Gadgets': 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=1200'
  };

  React.useEffect(() => {
    console.log('ShopView mounted with filters:', filters, 'user:', user?.id);
  }, [filters, user]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-24 animate-fadeIn flex flex-col lg:flex-row gap-20">
      <aside className="w-full lg:w-96 shrink-0 space-y-16">
        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Refine Search</h3>
          <div className="relative group">
            <input
              type="text"
              placeholder="PRODUCT, SKU OF TAGS..."
              value={filters.search}
              onChange={e => onFilterChange({...filters, search: e.target.value})}
              className="w-full bg-slate-50 border-2 border-slate-50 focus:border-[#FF4F00]/20 rounded-[32px] px-10 py-7 text-sm font-bold outline-none transition-all placeholder:text-slate-300 shadow-sm"
            />
            <svg className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-hover:text-[#FF4F00] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-10">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Collecties</h3>
            {filters.category !== 'All' && (
              <button onClick={() => onFilterChange({...filters, category: 'All'})} className="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest border-b border-[#FF4F00]">Reset</button>
            )}
          </div>
          <div className="flex flex-col gap-6">
            {['All', ...Object.keys(categoryImages)].map(c => (
              <button
                key={c}
                onClick={() => onFilterChange({...filters, category: c})}
                className={`text-left text-lg font-black uppercase tracking-tighter transition-all flex items-center justify-between group ${filters.category === c ? 'text-[#FF4F00]' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {c}
                <div className={`w-3 h-3 rounded-full bg-[#FF4F00] transition-all duration-300 ${filters.category === c ? 'scale-100' : 'scale-0 group-hover:scale-50 opacity-20'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-10">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Prijs Range</h3>
          <div className="px-2 space-y-8">
            <div className="flex justify-between items-end">
              <div className="space-y-1"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Min.</p><p className="text-sm font-black text-slate-900">€ 0</p></div>
              <div className="text-right space-y-1"><p className="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest">Max.</p><p className="text-xl font-black text-[#FF4F00]">€ {filters.maxPrice.toLocaleString()}</p></div>
            </div>
            <input type="range" min="0" max="10000" step="100" value={filters.maxPrice} onChange={e => onFilterChange({...filters, maxPrice: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#FF4F00]" />
          </div>
        </div>

        <div className="p-10 bg-slate-950 rounded-[50px] space-y-6 text-white overflow-hidden relative shadow-3xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4F00] blur-[80px] opacity-20" />
           <h4 className="text-xl font-black uppercase tracking-tighter relative z-10">Hulp Nodig?</h4>
           <p className="text-white/60 text-sm font-medium relative z-10 leading-relaxed">Onze curators staan klaar om al uw perguntas te beantwoorden.</p>
           <button onClick={() => {}} className="w-full py-5 bg-white text-slate-950 font-black rounded-3xl uppercase tracking-widest text-[10px] relative z-10 hover:bg-[#FF4F00] hover:text-white transition-all">Stuur Bericht</button>
        </div>
      </aside>

      <div className="flex-1 space-y-12">
        {/* Shop Header & Sort */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Resultaten <span className="text-slate-400">({products.length})</span></h2>
            <div className="flex flex-wrap gap-2">
              {filters.category !== 'All' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 animate-fadeIn">
                  {filters.category}
                  <button onClick={() => onRemoveFilter('category')} className="hover:text-[#FF4F00]">×</button>
                </div>
              )}
              {filters.search && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 animate-fadeIn">
                  "{filters.search}"
                  <button onClick={() => onRemoveFilter('search')} className="hover:text-[#FF4F00]">×</button>
                </div>
              )}
              {(filters.category !== 'All' || filters.search) && (
                <button onClick={onResetFilters} className="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest hover:underline ml-2">Wis alles</button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sorteer op:</span>
            <select
              value={filters.sortBy}
              onChange={e => onFilterChange({...filters, sortBy: e.target.value})}
              className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:text-[#FF4F00] transition-colors"
            >
              <option value="newest">Nieuwste</option>
              <option value="price_asc">Prijs: Laag - Hoog</option>
              <option value="price_desc">Prijs: Hoog - Laag</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={onViewProduct}
              onAddToCart={onAddToCart}
              isWishlisted={user?.wishlist?.includes(p.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="py-40 text-center space-y-8 bg-slate-50 rounded-[60px] border border-dashed border-slate-200 animate-fadeIn">
            <div className="text-8xl grayscale opacity-20">🔍</div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Geen items gevonden</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Probeer andere zoekwoorden of wis de filters.</p>
            </div>
            <button onClick={onResetFilters} className="px-10 py-5 bg-slate-950 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl">Filters Wissen</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopView;