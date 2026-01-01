
import React from 'react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  variant?: 'default' | 'featured';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onAddToCart, variant = 'default' }) => {
  if (variant === 'featured') {
    return (
      <div 
        onClick={() => onClick?.(product)}
        className="group relative w-full h-full min-h-[500px] rounded-[48px] overflow-hidden cursor-pointer bg-slate-100"
      >
        <img 
          src={product.image} 
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-10 left-10 right-10">
          <div className="flex flex-col gap-2">
            <span className="self-start px-4 py-1.5 bg-[#FF4F00] text-white text-[9px] font-black uppercase tracking-widest rounded-full mb-2 shadow-lg shadow-orange-500/20">
              Editor's Pick
            </span>
            <h3 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
              {product.title}
            </h3>
            <p className="text-xl font-black text-[#FF4F00]">
              €{product.price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col h-full bg-transparent">
      <div className="relative aspect-[4/5] bg-slate-50 rounded-[40px] overflow-hidden shadow-sm border border-slate-100/50">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <div className="space-y-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(product);
              }}
              className="w-full py-4 bg-white text-slate-900 font-black text-[11px] uppercase tracking-widest rounded-3xl shadow-xl hover:bg-slate-900 hover:text-white transition-all transform active:scale-95"
            >
              Snel Bekijken
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(product);
              }}
              className="w-full py-4 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl shadow-xl hover:bg-[#FF4F00] transition-all transform active:scale-95"
            >
              In Winkelmand
            </button>
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-start">
        <div className="space-y-1">
          <h3 
            onClick={() => onClick?.(product)} 
            className="text-sm font-black text-slate-900 uppercase tracking-tighter cursor-pointer hover:text-[#FF4F00] transition-colors line-clamp-1 pr-4"
          >
            {product.title}
          </h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{product.category}</p>
        </div>
        <span className="text-sm font-black text-slate-900 shrink-0">€{product.price.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default ProductCard;
