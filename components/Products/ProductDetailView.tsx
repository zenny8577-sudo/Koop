import React, { useState, useEffect } from 'react';
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  // Ensure we have a valid image even if gallery is missing
  const [activeImage, setActiveImage] = useState(product.image || 'https://via.placeholder.com/800');
  
  // Safe gallery access
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  useEffect(() => {
    setActiveImage(product.image || 'https://via.placeholder.com/800');
    window.scrollTo(0, 0);
  }, [product.id, product.image]);

  const handlePurchaseClick = () => {
    if (!user) {
      alert("Meld je aan om een aankoop te doen.");
      return;
    }
    onAddToCart?.(product);
    alert("Toegevoegd aan winkelwagen!");
  };

  // Função inteligente para gerar bandeira de qualquer país automaticamente
  const getFlagEmoji = (countryCode: string) => {
    // Se não tiver código ou não for 2 letras, retorna o globo
    if (!countryCode || countryCode.length !== 2) return '🌍';
    
    // Converte as letras do código (ex: "NL") para os símbolos regionais Unicode que formam a bandeira
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
      
    return String.fromCodePoint(...codePoints);
  };

  // Mapeamento robusto para ler tanto camelCase (mock) quanto snake_case (DB)
  const origin = product.originCountry || product.origin_country || 'NL';
  const delivery = product.estimatedDelivery || product.estimated_delivery || '2-4 werkdagen';

  if (showSuccess) return null;

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
            
            {/* Image Switcher Dots */}
            {gallery.length > 1 && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {gallery.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(img)} 
                    className={`w-3 h-3 rounded-full transition-all duration-500 border-2 ${activeImage === img ? 'bg-[#FF4F00] w-8 border-[#FF4F00]' : 'bg-white/50 border-white hover:bg-white'}`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Mini Gallery Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {gallery.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(img)} 
                  className={`w-24 h-24 rounded-3xl overflow-hidden border-4 shrink-0 transition-all ${activeImage === img ? 'border-[#FF4F00] scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}
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
              <div key={idx} className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.label}</p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Price & Cart Actions */}
        <div className="lg:col-span-5 space-y-12">
          <div className="sticky top-32 space-y-12">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => onToggleWishlist?.(product.id)} 
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${user?.wishlist?.includes(product.id) ? 'bg-[#FF4F00] text-white border-[#FF4F00]' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-white'}`}
                >
                  <svg className="w-4 h-4" fill={user?.wishlist?.includes(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  {user?.wishlist?.includes(product.id) ? 'Bewaard' : 'Bewaar voor later'}
                </button>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">{product.title}</h1>
              <div className="flex items-baseline gap-4 pt-4">
                <p className="text-7xl font-black text-slate-900 tracking-tighter">€ {product.price.toLocaleString()}</p>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inc. NL BTW</span>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed text-xl max-w-md">{product.description}</p>
            </div>
            
            <div className="p-10 bg-slate-950 rounded-[60px] text-white space-y-8 shadow-3xl">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Logo size="sm" variant="orange" className="scale-75" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#FF4F00]">Premium Transaction</p>
                  <h4 className="text-xl font-black uppercase tracking-tighter">Beveiligde Betaling</h4>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => onAddToCart?.(product)} 
                  className="w-full py-8 bg-[#FF4F00] text-white font-black rounded-[32px] uppercase tracking-widest text-[11px] shadow-2xl hover:bg-white hover:text-slate-900 transition-all transform hover:-translate-y-1"
                >
                  In Winkelwagen
                </button>
              </div>
              <p className="text-[9px] text-center text-white/40 font-bold uppercase tracking-widest">Betaal veilig via iDEAL ou Creditcard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;