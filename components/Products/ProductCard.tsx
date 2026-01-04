import React from 'react';
import { Product } from '../../types';
import { SupabaseService } from '../../services/supabaseService';
import { AnalyticsService } from '../../services/analyticsService';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
  variant?: 'default' | 'featured';
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, onClick, onAddToCart, onToggleWishlist, isWishlisted, variant = 'default' 
}) => {
  const isVerified = product.verification?.overallPassed;

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist?.(product.id);
    AnalyticsService.trackEvent('wishlist_toggle', {
      productId: product.id,
      action: isWishlisted ? 'remove' : 'add'
    });
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
    AnalyticsService.trackEvent('add_to_cart', {
      productId: product.id,
      category: product.category
    });
  };

  if (variant === 'featured') {
    return (
      <div 
        onClick={() => onClick?.(product)}
        className="group relative w-full h-full min-h-[500px] rounded-[48px] overflow-hidden cursor-pointer bg-slate-100 dark:bg-neutral-900 shadow-2xl border border-transparent dark:border-white/5"
      >
        <img 
          src={product.image} 
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 dark:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute top-8 right-8 flex flex-col gap-3 items-end">
          <button 
            onClick={handleWishlist}
            className={`w-14 h-14 rounded-full backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all ${isWishlisted ? 'bg-[#FF4F00] text-white border-none' : 'bg-black/30 text-white hover:bg-black/50'}`}
          >
            <svg className={`w-6 h-6 ${isWishlisted ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          {isVerified && (
            <div className="bg-white/95 backdrop-blur px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/50 animate-fadeIn">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Expert Verified</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-10 left-10 right-10 space-y-4">
          <div className="flex flex-col gap-1">
            <span className="self-start px-4 py-1.5 bg-[#FF4F00] text-white text-[9px] font-black uppercase tracking-widest rounded-full mb-2 shadow-lg shadow-orange-500/20">
              Premium Choice
            </span>
            <h3 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-2xl">
              {product.title}
            </h3>
            <div className="flex items-center gap-4">
              <p className="text-2xl font-black text-[#FF4F00]">€{product.price.toLocaleString()}</p>
              <div className="w-1 h-1 bg-white/30 rounded-full" />
              <p className="text-white/60 text-sm font-bold uppercase tracking-widest">{product.category}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col h-full bg-transparent">
      <div className="relative aspect-[4/5] bg-slate-50 dark:bg-neutral-900 rounded-[40px] overflow-hidden shadow-sm border border-slate-100/50 dark:border-white/5 transition-all duration-500 hover:shadow-2xl hover:border-slate-200 dark:hover:border-white/10">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-100 dark:opacity-90"
        />
        
        {/* Actions Overlays */}
        <div className="absolute top-5 right-5 z-20">
          <button 
            onClick={handleWishlist}
            className={`w-10 h-10 rounded-full backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all ${isWishlisted ? 'bg-[#FF4F00] text-white border-none' : 'bg-white/30 dark:bg-black/40 text-slate-900 dark:text-white hover:bg-white/50 dark:hover:bg-black/60'}`}
          >
            <svg className={`w-5 h-5 ${isWishlisted ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
          {isVerified && (
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 border border-white/50 dark:border-white/10">
              <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Verified</span>
            </div>
          )}
        </div>

        {/* Action Button Strip */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onClick?.(product); }}
            className="flex-1 py-4 bg-white dark:bg-black text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all transform active:scale-95"
          >
            Details
          </button>
          <button 
            onClick={handleAddToCartClick}
            className="w-12 h-12 bg-[#FF4F00] text-white flex items-center justify-center rounded-2xl shadow-xl hover:bg-slate-900 dark:hover:bg-white dark:hover:text-black transition-all transform active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-start">
        <div className="space-y-1 group-hover:translate-x-1 transition-transform">
          <h3 
            onClick={() => onClick?.(product)} 
            className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter cursor-pointer hover:text-[#FF4F00] dark:hover:text-[#FF4F00] transition-colors line-clamp-1 pr-4"
          >
            {product.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-[#FF4F00] rounded-full" />
            <p className="text-[9px] text-slate-400 dark:text-neutral-500 font-black uppercase tracking-[0.2em]">{product.category}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-slate-900 dark:text-white block">€{product.price.toLocaleString()}</span>
          <span className="text-[8px] font-bold text-slate-300 dark:text-neutral-600 uppercase tracking-widest">Incl. VAT</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;