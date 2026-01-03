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
  const [isPaying, setIsPaying] = useState(false);
  const [step, setStep] = useState<'details' | 'shipping'>('details');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showVerificationReport, setShowVerificationReport] = useState(false);
  const [activeImage, setActiveImage] = useState(product.image);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Mock reviews data
    setReviews([
      {
        id: '1',
        productId: product.id,
        userId: 'user1',
        userName: 'Anna van Dijk',
        rating: 5,
        comment: 'Perfecte staat, precies zoals beschreven. Snelle verzending en uitstekende communicatie.',
        createdAt: '2024-01-15'
      }
    ]);
    
    setActiveImage(product.image);
    
    // Mock related products
    setRelatedProducts([
      {
        id: '2',
        sellerId: 'user_123',
        title: 'MacBook Air M2',
        description: 'Premium quality item in LIKE_NEW condition.',
        price: 1299,
        condition: 'LIKE_NEW',
        status: ProductStatus.ACTIVE,
        category: 'Elektronica',
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
        commissionRate: 0.15,
        commissionAmount: 194.85,
        sku: 'KOOP-TECH-1002',
        barcode: '871234561002',
        weight: 1.2,
        shippingMethods: ['postnl', 'dhl'],
        is3DModel: false
      }
    ]);
    
    window.scrollTo(0, 0);
  }, [product.id, product.image, product.category]);

  const isSellerVerified = product.sellerId === 'user_123'; // Mock verification
  const isKoopDirect = product.sellerId.includes('admin');
  const verification = product.verification;

  const handlePurchaseClick = () => {
    if (!user) {
      alert("Meld je aan om een aankoop te doen.");
      return;
    }
    setStep('shipping');
  };

  const finalizeInternalPurchase = () => {
    setIsPaying(true);
    setTimeout(() => {
      // In a real implementation, this would create a transaction in Supabase
      console.log('Creating transaction for product:', product.id);
      setIsPaying(false);
      setShowSuccess(true);
      setTimeout(() => onBack(), 3000);
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn px-6">
        <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-xl">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">Bedankt!</h2>
        <p className="text-slate-500 max-w-sm mx-auto font-medium text-lg uppercase tracking-widest">Aankoop Voltooid.</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn px-6 pb-40 pt-10 max-w-[1440px] mx-auto">
      <button 
        onClick={() => step === 'shipping' ? setStep('details') : onBack} 
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
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {(product.gallery || [product.image]).map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(img)} 
                  className={`w-3 h-3 rounded-full transition-all duration-500 border-2 ${activeImage === img ? 'bg-[#FF4F00] w-8 border-[#FF4F00]' : 'bg-white/50 border-white hover:bg-white'}`}
                />
              ))}
            </div>
          </div>
          
          {/* Mini Gallery Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {(product.gallery || [product.image]).map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(img)} 
                className={`w-24 h-24 rounded-3xl overflow-hidden border-4 shrink-0 transition-all ${activeImage === img ? 'border-[#FF4F00] scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            {[
              { label: 'Conditie', val: product.condition.replace('_', ' ') },
              { label: 'Categorie', val: product.category },
              { label: 'Identiteit', val: 'Geverifieerd' },
              { label: 'Locatie', val: 'Amsterdam Depot' }
            ].map(item => (
              <div key={item.label} className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.label}</p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.val}</p>
              </div>
            ))}
          </div>
          
          {/* Review List */}
          <div className="pt-24 space-y-12">
            <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Wat anderen zeggen<span className="text-[#FF4F00]">.</span></h3>
            {reviews.length === 0 ? (
              <div className="p-20 bg-slate-50 rounded-[60px] text-center border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nog geen reviews voor dit item.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {reviews.map(review => (
                  <div key={review.id} className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-black text-xs uppercase">{review.userName[0]}</div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase">{review.userName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(review.createdAt).toLocaleDateString('nl-NL')}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Price & Cart Actions */}
        <div className="lg:col-span-5 space-y-12">
          <div className="sticky top-32 space-y-12">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {verification?.overallPassed && (
                  <button 
                    onClick={() => setShowVerificationReport(!showVerificationReport)} 
                    className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2 hover:bg-emerald-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Expert Verified
                  </button>
                )}
                <button 
                  onClick={() => onToggleWishlist?.(product.id)} 
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${user?.wishlist?.includes(product.id) ? 'bg-[#FF4F00] text-white border-[#FF4F00]' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-white'}`}
                >
                  <svg className="w-4 h-4" fill={user?.wishlist?.includes(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  {user?.wishlist?.includes(product.id) ? 'Bewaard' : 'Bewaar voor later'}
                </button>
              </div>
              <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.85] uppercase">{product.title}</h1>
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
                <button 
                  onClick={handlePurchaseClick} 
                  className="w-full py-8 bg-white/10 text-white font-black rounded-[32px] border border-white/20 uppercase tracking-widest text-[11px] hover:bg-white/20 transition-all"
                >
                  Nu Direct Kopen
                </button>
              </div>
              <p className="text-[9px] text-center text-white/40 font-bold uppercase tracking-widest">Betaal veilig via iDEAL ou Creditcard</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-40 space-y-16 border-t border-slate-100 pt-32">
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">Suggesties</span>
              <h2 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase">Vergelijkbare Items<span className="text-[#FF4F00]">.</span></h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {relatedProducts.map(p => (
              <div key={p.id} className="flex flex-col h-full bg-transparent">
                <div className="relative aspect-[4/5] bg-slate-50 rounded-[40px] overflow-hidden shadow-sm border border-slate-100/50 transition-all duration-500 hover:shadow-2xl hover:border-slate-200">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex gap-2">
                    <button className="flex-1 py-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:bg-slate-900 hover:text-white transition-all transform active:scale-95">
                      Details
                    </button>
                    <button className="w-12 h-12 bg-[#FF4F00] text-white flex items-center justify-center rounded-2xl shadow-xl hover:bg-slate-900 transition-all transform active:scale-95">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="pt-6 flex justify-between items-start">
                  <div className="space-y-1 group-hover:translate-x-1 transition-transform">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter cursor-pointer hover:text-[#FF4F00] transition-colors line-clamp-1 pr-4">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#FF4F00] rounded-full" />
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 block">€{p.price.toLocaleString()}</span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Incl. VAT</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailView;