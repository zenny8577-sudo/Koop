import React, { useState } from 'react';
import ProductCard from '../Products/ProductCard';
import { Product, ProductCondition } from '../../types';
import ContactModal from '../Shop/ContactModal';
import { useLanguage } from '../../context/LanguageContext';

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

const CATEGORY_MAP: Record<string, string[]> = {
  'Elektronica': ['Smartphones', 'Laptops', 'Audio', 'Camera', 'Gaming', 'TV & Home Cinema'],
  'Design': ['Stoelen', 'Tafels', 'Verlichting', 'Kasten', 'Decoratie', 'Banken'],
  'Fietsen': ['Stadsfietsen', 'E-bikes', 'Racefietsen', 'Bakfietsen', 'Kinderfietsen'],
  'Vintage Mode': ['Tassen', 'Kleding', 'Accessoires', 'Schoenen', 'Horloges', 'Sieraden'],
  'Kunst & Antiek': ['Schilderijen', 'Sculpturen', 'Keramiek', 'Klokken', 'Glaswerk'],
  'Gadgets': ['Drones', 'Smart Home', 'Wearables', 'Keuken', '3D Printers']
};

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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { t } = useLanguage();

  // Filtro local para garantir que subcategorias e condição sejam aplicadas
  const filteredProducts = products.filter(p => {
    if (filters.subcategory && p.subcategory !== filters.subcategory) return false;
    if (filters.condition !== 'All' && p.condition !== filters.condition) return false;
    return true;
  });

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 lg:py-24 animate-fadeIn flex flex-col lg:flex-row gap-12 lg:gap-20">
      
      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        user={user} 
      />

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button 
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="w-full flex justify-between items-center bg-slate-50 p-6 rounded-[32px] border border-slate-100"
        >
          <span className="font-black uppercase tracking-widest text-xs">{t('shop_mobile_filters')}</span>
          <svg className={`w-5 h-5 transition-transform ${isMobileFiltersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      <aside className={`w-full lg:w-80 xl:w-96 shrink-0 space-y-12 lg:block ${isMobileFiltersOpen ? 'block' : 'hidden'}`}>
        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-neutral-500">Zoeken</h3>
          <div className="relative group">
            <input
              type="text"
              placeholder={t('shop_search_placeholder')}
              value={filters.search}
              onChange={e => onFilterChange({...filters, search: e.target.value})}
              className="w-full bg-slate-50 dark:bg-neutral-900 border-2 border-slate-50 dark:border-transparent focus:border-[#FF4F00]/20 dark:focus:border-[#FF4F00]/50 rounded-[32px] px-8 py-5 text-sm font-bold outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-white/20 text-slate-900 dark:text-white shadow-sm dark:shadow-none"
            />
            <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-white/30 group-hover:text-[#FF4F00] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {/* Categories & Subcategories */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-neutral-500">{t('shop_collections')}</h3>
            {filters.category !== 'All' && (
              <button onClick={() => onFilterChange({...filters, category: 'All', subcategory: ''})} className="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest hover:underline">{t('shop_reset')}</button>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onFilterChange({...filters, category: 'All', subcategory: ''})}
              className={`text-left text-base font-black uppercase tracking-tight transition-all flex items-center justify-between group py-2 px-4 rounded-xl ${filters.category === 'All' ? 'bg-[#FF4F00]/5 text-[#FF4F00]' : 'text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50'}`}
            >
              {t('shop_all_products')}
            </button>
            
            {Object.keys(CATEGORY_MAP).map(c => (
              <div key={c} className="flex flex-col">
                <button
                  onClick={() => onFilterChange({...filters, category: c, subcategory: ''})}
                  className={`text-left text-base font-black uppercase tracking-tight transition-all flex items-center justify-between group py-2 px-4 rounded-xl ${filters.category === c ? 'bg-[#FF4F00]/5 text-[#FF4F00]' : 'text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50'}`}
                >
                  {c}
                  <div className={`w-2 h-2 rounded-full bg-[#FF4F00] transition-all duration-300 ${filters.category === c ? 'scale-100' : 'scale-0'}`} />
                </button>
                
                {/* Subcategories */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${filters.category === c ? 'max-h-96 opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col gap-1 pl-4 mt-1">
                    {CATEGORY_MAP[c].map(sub => (
                      <button
                        key={sub}
                        onClick={() => onFilterChange({...filters, category: c, subcategory: sub === filters.subcategory ? '' : sub})}
                        className={`text-left text-xs font-bold uppercase tracking-widest transition-all py-2 px-4 rounded-lg border-l-2 ${filters.subcategory === sub ? 'border-[#FF4F00] text-slate-900 dark:text-white bg-slate-50' : 'border-slate-100 text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-300 hover:border-slate-300'}`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Condition Filter */}
        <div className="space-y-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-neutral-500">{t('shop_condition')}</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="condition" 
                checked={filters.condition === 'All'}
                onChange={() => onFilterChange({...filters, condition: 'All'})}
                className="w-4 h-4 accent-[#FF4F00]"
              />
              <span className={`text-xs font-bold uppercase tracking-widest group-hover:text-slate-900 transition-colors ${filters.condition === 'All' ? 'text-slate-900' : 'text-slate-400'}`}>{t('shop_condition_all')}</span>
            </label>
            {Object.values(ProductCondition).map(cond => (
              <label key={cond} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="condition" 
                  checked={filters.condition === cond}
                  onChange={() => onFilterChange({...filters, condition: cond})}
                  className="w-4 h-4 accent-[#FF4F00]"
                />
                <span className={`text-xs font-bold uppercase tracking-widest group-hover:text-slate-900 transition-colors ${filters.condition === cond ? 'text-slate-900' : 'text-slate-400'}`}>
                  {cond.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
             <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-neutral-500">{t('shop_price')}</h3>
             {filters.maxPrice < 10000 && (
                <button onClick={() => onFilterChange({...filters, maxPrice: 10000})} className="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest hover:underline">{t('shop_reset')}</button>
             )}
          </div>
          <div className="px-2 space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1"><p className="text-[9px] font-black text-slate-300 dark:text-neutral-600 uppercase tracking-widest">{t('shop_price_to')}</p><p className="text-xl font-black text-slate-900 dark:text-white">€ {filters.maxPrice.toLocaleString()}</p></div>
            </div>
            <input type="range" min="0" max="10000" step="100" value={filters.maxPrice} onChange={e => onFilterChange({...filters, maxPrice: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-[#FF4F00]" />
          </div>
        </div>

        <div className="p-10 bg-slate-950 dark:bg-neutral-900 rounded-[40px] space-y-6 text-white overflow-hidden relative shadow-2xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4F00] blur-[80px] opacity-20" />
           <h4 className="text-xl font-black uppercase tracking-tighter relative z-10">{t('shop_help_title')}</h4>
           <p className="text-white/60 text-sm font-medium relative z-10 leading-relaxed">{t('shop_help_desc')}</p>
           <button 
             onClick={() => setIsContactModalOpen(true)} 
             className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl uppercase tracking-widest text-[10px] relative z-10 hover:bg-[#FF4F00] hover:text-white transition-all"
           >
             {t('shop_help_btn')}
           </button>
        </div>
      </aside>

      <div className="flex-1 space-y-12">
        {/* Shop Header & Sort */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-100 dark:border-white/10">
          <div className="space-y-2">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{t('shop_results')} <span className="text-slate-400 dark:text-neutral-600">({filteredProducts.length})</span></h2>
            <div className="flex flex-wrap gap-2">
              {filters.category !== 'All' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/10 rounded-full text-[9px] font-black text-slate-500 dark:text-white uppercase tracking-widest border border-slate-100 dark:border-white/5 animate-fadeIn">
                  {filters.category}
                  <button onClick={() => onRemoveFilter('category')} className="hover:text-[#FF4F00]">×</button>
                </div>
              )}
              {filters.condition !== 'All' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/10 rounded-full text-[9px] font-black text-slate-500 dark:text-white uppercase tracking-widest border border-slate-100 dark:border-white/5 animate-fadeIn">
                  {filters.condition.replace('_', ' ')}
                  <button onClick={() => onFilterChange({...filters, condition: 'All'})} className="hover:text-[#FF4F00]">×</button>
                </div>
              )}
              {filters.subcategory && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full text-[9px] font-black text-purple-600 dark:text-purple-300 uppercase tracking-widest border border-purple-100 dark:border-purple-500/20 animate-fadeIn">
                  {filters.subcategory}
                  <button onClick={() => onFilterChange({...filters, subcategory: ''})} className="hover:text-purple-800">×</button>
                </div>
              )}
              {filters.search && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/10 rounded-full text-[9px] font-black text-slate-500 dark:text-white uppercase tracking-widest border border-slate-100 dark:border-white/5 animate-fadeIn">
                  "{filters.search}"
                  <button onClick={() => onRemoveFilter('search')} className="hover:text-[#FF4F00]">×</button>
                </div>
              )}
              {(filters.category !== 'All' || filters.search || filters.subcategory || filters.condition !== 'All') && (
                <button onClick={onResetFilters} className="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest hover:underline ml-2">{t('shop_clear_filters')}</button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest">{t('shop_sort_label')}</span>
            <select
              value={filters.sortBy}
              onChange={e => onFilterChange({...filters, sortBy: e.target.value})}
              className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:text-[#FF4F00] dark:text-white transition-colors"
            >
              <option value="newest" className="text-slate-900">{t('shop_sort_newest')}</option>
              <option value="price_asc" className="text-slate-900">{t('shop_sort_price_asc')}</option>
              <option value="price_desc" className="text-slate-900">{t('shop_sort_price_desc')}</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 lg:gap-x-12 gap-y-12 lg:gap-y-24">
          {filteredProducts.map(p => (
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

        {filteredProducts.length === 0 && (
          <div className="py-40 text-center space-y-8 bg-slate-50 dark:bg-white/5 rounded-[60px] border border-dashed border-slate-200 dark:border-white/10 animate-fadeIn">
            <div className="text-8xl grayscale opacity-20 dark:invert">🔍</div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('shop_empty_title')}</h3>
              <p className="text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-[10px]">{t('shop_empty_desc')}</p>
            </div>
            <button onClick={onResetFilters} className="px-10 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl">{t('shop_clear_filters')}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopView;