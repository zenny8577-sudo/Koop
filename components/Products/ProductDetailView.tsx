import React, { useState, useEffect, useMemo } from 'react';
import { Product, Review, User, ProductStatus } from '../../types';
import Logo from '../Branding/Logo';

interface ProductDetailViewProps {
  product: Product;
  user: User | null;
  onBack: () => void;
  onAddToCart?: (p: Product) => void;
  onToggleWishlist?: (id: string) => void;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, user, onBack, onAddToCart, onToggleWishlist }) => {
  // Unifica imagem principal e galeria em uma lista única sem duplicatas
  const allImages = useMemo(() => {
    const images = [product.image, ...(product.gallery || [])].filter(url => url && url.length > 5); // Filtra URLs vazias
    return [...new Set(images)]; // Remove duplicatas
  }, [product]);

  const [activeImage, setActiveImage] = useState(allImages[0]);

  useEffect(() => {
    setActiveImage(allImages[0]);
    window.scrollTo(0, 0);
  }, [product.id, allImages]);

  // País e Entrega com fallbacks seguros
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const origin = product.originCountry || product.origin_country || 'NL';
  const delivery = product.estimatedDelivery || product.estimated_delivery || '2-4 werkdagen';

  return (
    <div className="animate-fadeIn px-6 pb-40 pt-10 max-w-[1440px] mx-auto">
      <button 
        onClick={onBack} 
        className="mb-12 flex items-center gap-3 group"
      >
        <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Terug naar Collectie</span>
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Gallery & Carousel */}
        <div className="lg:col-span-7 space-y-8">
          <div className="aspect-square rounded-[60px] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl relative group">
            <img src={activeImage} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt={product.title} />
            
            {/* Dots Navigation */}
            {allImages.length > 1 && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full">
                {allImages.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(img)} 
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeImage === img ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Thumbnails Strip */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-4">
              {allImages.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(img)} 
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-[#FF4F00] opacity-100 ring-2 ring-[#FF4F00]/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            {[
              { label: 'Conditie', val: product.condition.replace('_', ' ') },
              { label: 'Categorie', val: product.category },
              { label: 'Herkomst', val: `${getFlagEmoji(origin)} ${origin.toUpperCase()}` },
              { label: 'Levertijd', val: delivery }
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Price & Actions */}
        <div className="lg:col-span-5 space-y-12">
          <div className="sticky top-32 space-y-12">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => onToggleWishlist?.(product.id)} 
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${user?.wishlist?.includes(product.id) ? 'bg-[#FF4F00] text-white border-[#FF4F00]' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-white'}`}
                >
                  <svg className="w-4 h-4" fill={user?.wishlist?.includes(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  {user?.wishlist?.includes(product.id) ? 'Bewaard' : 'Bewaar'}
                </button>
                {product.status === 'PENDING_APPROVAL' && (
                   <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">In Review</span>
                )}
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">{product.title}</h1>
              
              <div className="flex items-baseline gap-4 pt-4 border-b border-slate-100 pb-8">
                <p className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter">€ {product.price.toLocaleString()}</p>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BTW Inclusief</span>
              </div>
              
              <div className="prose prose-slate">
                 <p className="text-slate-500 font-medium leading-relaxed text-lg">{product.description}</p>
              </div>
            </div>
            
            <div className="p-10 bg-slate-950 rounded-[50px] text-white space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4F00] blur-[100px] opacity-20 pointer-events-none" />
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Logo size="sm" variant="orange" className="scale-75" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#FF4F00]">Geverifieerde Verkoop</p>
                  <h4 className="text-lg font-black uppercase tracking-tighter">Veilig Bestellen</h4>
                </div>
              </div>
              
              <button 
                onClick={() => onAddToCart?.(product)} 
                className="w-full py-7 bg-[#FF4F00] text-white font-black rounded-[24px] uppercase tracking-widest text-[11px] shadow-lg hover:bg-white hover:text-slate-900 transition-all transform hover:-translate-y-1 relative z-10"
              >
                In Winkelwagen
              </button>
              
              <div className="flex justify-center flex-wrap gap-6 opacity-60 grayscale relative z-10">
                 <img src="/assets/postnl.png" className="h-6 w-auto object-contain" alt="PostNL" />
                 <img src="/assets/dhl.png" className="h-6 w-auto object-contain" alt="DHL" />
                 <img src="/assets/fedex.png" className="h-5 w-auto object-contain" alt="FedEx" />
                 <img src="/assets/ups.png" className="h-6 w-auto object-contain" alt="UPS" />
                 <img src="/assets/dpd.png" className="h-6 w-auto object-contain" alt="DPD" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;