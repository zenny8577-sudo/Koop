
import React, { useState } from 'react';
import { Product, Review, User, ProductStatus } from '../../types';
import { db } from '../../services/db';
import Logo from '../Branding/Logo';

interface ProductDetailViewProps {
  product: Product;
  user: User | null;
  onBack: () => void;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, user, onBack }) => {
  const [reviews] = useState<Review[]>(db.getReviews(product.id));
  const [isPaying, setIsPaying] = useState(false);
  const [step, setStep] = useState<'details' | 'shipping'>('details');
  const [shippingCarrier, setShippingCarrier] = useState<'postnl' | 'dhl' | 'fedex'>('postnl');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const isKoopDirect = product.sellerId === 'admin_1' || product.sellerId.includes('admin');

  const handlePurchaseClick = () => {
    if (product.stripeLink) {
      window.open(product.stripeLink, '_blank');
      return;
    }
    if (!user) {
      alert("Meld je aan om een aankoop te doen.");
      return;
    }
    setStep('shipping');
  };

  const finalizeInternalPurchase = () => {
    setIsPaying(true);
    setTimeout(() => {
      db.createTransaction(product.id, user!);
      setIsPaying(false);
      setShowSuccess(true);
      setTimeout(() => onBack(), 3000);
    }, 2000);
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-3.5 h-3.5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
    </div>
  );

  if (showSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn px-6">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-xl">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Bedankt!</h2>
        <p className="text-slate-500 max-w-sm mx-auto font-medium">Je aankoop van <strong>{product.title}</strong> is geslaagd. Check je mail voor de details.</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn px-6 pb-40 pt-10 max-w-[1440px] mx-auto">
      <button onClick={() => step === 'shipping' ? setStep('details') : onBack()} className="mb-12 flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Terug</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Images & Visual Info */}
        <div className="lg:col-span-7 space-y-8">
           <div className="aspect-square rounded-[60px] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl relative group">
              <img src={product.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              {isKoopDirect && (
                <div className="absolute top-10 left-10 scale-75 lg:scale-100 origin-top-left">
                  <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/50">
                    <div className="w-6 h-6 bg-[#FF4F00] rounded-lg flex items-center justify-center">
                      <span className="text-white font-black text-[10px]">K</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Koop Direct</span>
                  </div>
                </div>
              )}
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Conditie', val: product.condition.replace('_', ' ') },
                { label: 'Categorie', val: product.category },
                { label: 'Locatie', val: 'Nederland' },
                { label: 'Shipping', val: 'Free Delivery' }
              ].map(item => (
                <div key={item.label} className="p-8 bg-slate-50 rounded-[40px] border border-slate-100/50">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.label}</p>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.val}</p>
                </div>
              ))}
           </div>

           {product.tags && product.tags.length > 0 && (
             <div className="flex flex-wrap gap-2 pt-4">
                {product.tags.map(tag => (
                  <span key={tag} className="px-5 py-2.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200">#{tag}</span>
                ))}
             </div>
           )}
        </div>

        {/* Action & Info Area */}
        <div className="lg:col-span-5 space-y-12">
          {step === 'details' ? (
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Expert Verified
                  </div>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.85] uppercase">{product.title}</h1>
                <div className="flex items-center gap-4">
                  <StarRating rating={4.8} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reviews.length} Trust Reviews</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <p className="text-6xl font-black text-slate-900 tracking-tighter">€ {product.price.toLocaleString()}</p>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inclusief BTW</span>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-500 font-medium leading-relaxed text-lg">{product.description}</p>
                </div>
              </div>
              
              <div className="p-10 bg-slate-50 rounded-[50px] border border-slate-100 space-y-8 shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-slate-200">
                    {isKoopDirect ? (
                      <div className="scale-75"><Logo size="sm" variant="orange" showText={false} /></div>
                    ) : (
                      <img src={`https://ui-avatars.com/api/?name=${product.sellerId}&background=001A3D&color=fff`} className="w-full h-full" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verkocht door</p>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                      {isKoopDirect ? 'Koop Direct B.V.' : `Seller #${product.sellerId.split('_')[1] || 'Partner'}`}
                    </h4>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handlePurchaseClick}
                    className="w-full py-7 bg-slate-900 text-white font-black rounded-[32px] uppercase tracking-widest text-[11px] shadow-2xl hover:bg-[#FF4F00] transition-all transform hover:-translate-y-1"
                  >
                    {product.stripeLink ? 'Buy Now via Stripe' : 'Begin Checkout'}
                  </button>
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="w-full py-7 bg-white text-slate-900 border border-slate-200 font-black rounded-[32px] uppercase tracking-widest text-[11px] hover:bg-slate-50 transition-all"
                  >
                    Stuur een bericht
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-fadeIn">
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Verzending & Verificatie</h2>
               <div className="p-8 bg-blue-50/50 rounded-[40px] border border-blue-100/50">
                  <p className="text-[11px] font-bold text-blue-900 leading-relaxed uppercase">Dit item wordt fysiek gecontroleerd in ons Amsterdamse depot voordat het wordt vrijgegeven voor levering.</p>
               </div>
               
               <div className="space-y-4">
                  {[
                    { id: 'postnl', name: 'PostNL Verzekerd', price: 'Free', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/PostNL_logo.svg' },
                  ].map(carrier => (
                    <div 
                      key={carrier.id}
                      className="w-full p-8 rounded-[40px] border-2 border-[#FF4F00] bg-orange-50/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-5">
                        <img src={carrier.logo} className="h-6 w-12 object-contain" />
                        <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{carrier.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{carrier.price}</span>
                    </div>
                  ))}
               </div>

               <div className="pt-10 space-y-6 border-t border-slate-100">
                  <div className="flex justify-between items-center px-4">
                     <span className="text-slate-500 uppercase font-black text-[10px] tracking-widest">Subtotaal</span>
                     <span className="text-3xl font-black text-slate-900 tracking-tighter">€ {product.price.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={finalizeInternalPurchase}
                    disabled={isPaying}
                    className="w-full py-8 bg-slate-900 text-white font-black rounded-[32px] uppercase tracking-widest text-[13px] shadow-2xl hover:bg-[#FF4F00] transition-all disabled:opacity-50"
                  >
                    {isPaying ? 'Processing Payment...' : 'Bestelling Voltooien'}
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowContactModal(false)} />
          <div className="relative bg-white w-full max-w-xl p-12 lg:p-16 rounded-[60px] shadow-2xl space-y-10">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Contact Verkoper</h2>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setShowContactModal(false); alert('Bericht verzonden!'); }}>
              <textarea required placeholder="Uw vraag over dit product..." className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 text-sm font-bold outline-none h-48 focus:ring-4 focus:ring-orange-500/10 transition-all" />
              <button className="w-full py-6 bg-slate-900 text-white font-black rounded-[32px] uppercase tracking-widest text-[11px] hover:bg-[#FF4F00] transition-all">Verstuur</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailView;
