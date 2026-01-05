import React from 'react';
import ProductCard from '../Products/ProductCard';
import { Product, User, UserRole } from '../../types';

interface HomeViewProps {
  products: Product[];
  user: User | null;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onNavigate: (view: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({
  products,
  user,
  onViewProduct,
  onAddToCart,
  onToggleWishlist,
  onNavigate
}) => {
  const [activeSpotlight, setActiveSpotlight] = React.useState(0);
  const spotlightProducts = products.slice(0, 3);
  const recentProducts = products.slice(10, 14);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveSpotlight(prev => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const categoryImages: Record<string, string> = {
    'Elektronica': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200',
    'Design': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200',
    'Fietsen': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=1200',
    'Antiek': 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=1200',
    'Gadgets': 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=1200'
  };

  return (
    <div className="space-y-24 lg:space-y-40 pb-20 lg:pb-60 animate-fadeIn overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] lg:h-[95vh] flex flex-col justify-center px-6 lg:px-24 mx-2 lg:mx-12 rounded-[40px] lg:rounded-[120px] overflow-hidden bg-black mt-2 lg:mt-8 group border border-transparent dark:border-white/10 py-12 lg:py-0">
        <div className="absolute inset-0 z-0 scale-105 group-hover:scale-100 transition-transform duration-[3s] ease-out">
          <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=90&w=2400" className="w-full h-full object-cover opacity-50" alt="Dutch Tech Design" />
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-5xl space-y-6 lg:space-y-14">
          <div className="space-y-3 lg:space-y-4">
            <span className="inline-block px-3 py-1.5 lg:px-5 lg:py-2.5 bg-[#FF4F00]/10 text-[#FF4F00] text-[8px] lg:text-[11px] font-black uppercase tracking-[0.2em] lg:tracking-[0.4em] rounded-full border border-[#FF4F00]/20 backdrop-blur-md whitespace-nowrap">De Nederlandse Premium Standaard</span>
            <h1 className="text-4xl sm:text-5xl lg:text-[160px] font-black text-white leading-[0.9] lg:leading-[0.8] tracking-tighter uppercase break-words">
              HERGEBRUIKTE <br /> <span className="text-[#FF4F00]">MEESTERWERKEN.</span>
            </h1>
          </div>
          <p className="text-white/60 text-sm lg:text-2xl font-medium max-w-2xl leading-relaxed pr-4 lg:pr-0">Amsterdam's meest exclusieve marktplaats voor geverifieerde tech en designmeubels. Gecureerd door experts, geleverd met zorg.</p>
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-8 pt-4 lg:pt-6 w-full sm:w-auto">
            <button onClick={() => onNavigate('shop')} className="w-full sm:w-auto px-6 py-4 lg:px-16 lg:py-8 bg-[#FF4F00] text-white font-black text-[10px] lg:text-xs uppercase tracking-[0.3em] rounded-2xl lg:rounded-[32px] hover:bg-white hover:text-black transition-all transform hover:-translate-y-2 shadow-2xl shadow-orange-500/20">Shop de Collectie</button>
            <button onClick={() => onNavigate('sell')} className="w-full sm:w-auto px-6 py-4 lg:px-16 lg:py-8 bg-white/5 backdrop-blur-xl text-white border border-white/10 font-black text-[10px] lg:text-xs uppercase tracking-[0.3em] rounded-2xl lg:rounded-[32px] hover:bg-white/10 transition-all">Start Verkoop</button>
          </div>
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 lg:mb-12 gap-6">
          <div className="space-y-2">
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">Vers uit curatie</span>
            <h2 className="text-3xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Nieuwe Items<span className="text-[#FF4F00]">.</span></h2>
          </div>
          <button onClick={() => onNavigate('shop')} className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-neutral-500 hover:text-[#FF4F00] transition-colors border-b-2 border-slate-100 dark:border-white/10 hover:border-[#FF4F00] pb-2">Bekijk alles →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 lg:gap-12">
          {recentProducts.map(p => (
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
      </section>

      {/* Spotlight Carousel */}
      <section className="px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto space-y-8 lg:space-y-12">
           <div className="flex justify-between items-end">
              <div className="space-y-2">
                <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">Exclusieve Curatie</span>
                <h2 className="text-3xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Product Spotlight<span className="text-[#FF4F00]">.</span></h2>
              </div>
              <div className="flex gap-2 lg:gap-3">
                 {spotlightProducts.map((_, i) => (
                   <button
                     key={i}
                     onClick={() => setActiveSpotlight(i)}
                     className={`h-1 lg:h-1.5 transition-all duration-500 rounded-full ${activeSpotlight === i ? 'bg-[#FF4F00] w-8 lg:w-12' : 'bg-slate-200 dark:bg-white/10 w-2 lg:w-4'}`}
                   />
                 ))}
              </div>
           </div>

           <div className="relative h-[500px] lg:h-[700px] overflow-hidden rounded-[40px] lg:rounded-[80px] group border border-transparent dark:border-white/5 bg-neutral-900">
              {spotlightProducts.map((product, i) => (
                <div
                  key={product.id}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${activeSpotlight === i ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-full scale-110 pointer-events-none'}`}
                >
                   <ProductCard
                     product={product}
                     variant="featured"
                     onClick={onViewProduct}
                     onAddToCart={onAddToCart}
                     isWishlisted={user?.wishlist?.includes(product.id)}
                     onToggleWishlist={onToggleWishlist}
                   />
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Category Explorer */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 lg:mb-20">
          <div className="space-y-4">
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">Navigeer per Stijl</span>
            <h2 className="text-4xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Ontdek <br /> Collecties<span className="text-[#FF4F00]">.</span></h2>
          </div>
          <p className="text-slate-500 dark:text-neutral-400 font-medium max-w-sm text-sm lg:text-lg leading-relaxed">Onze curators hebben de meest exclusieve items voor u geselecteerd, gecategoriseerd op esthetiek en vakmanschap.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 h-auto md:h-[1000px] lg:h-[800px]">
          {/* Tech - Wide */}
          <div className="h-[300px] md:h-auto md:col-span-8 group relative overflow-hidden rounded-[40px] lg:rounded-[60px] cursor-pointer border border-transparent dark:border-white/5" onClick={() => { onNavigate('shop'); }}>
            <img src={categoryImages['Elektronica']} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-12 space-y-2">
              <span className="text-[9px] lg:text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.5em] block translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Premium Tech</span>
              <h4 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter">Elektronica</h4>
            </div>
          </div>

          {/* Design - Tall */}
          <div className="h-[300px] md:h-auto md:col-span-4 group relative overflow-hidden rounded-[40px] lg:rounded-[60px] cursor-pointer border border-transparent dark:border-white/5" onClick={() => { onNavigate('shop'); }}>
            <img src={categoryImages['Design']} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-12 space-y-2">
              <span className="text-[9px] lg:text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.5em] block translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Living Interior</span>
              <h4 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter">Design</h4>
            </div>
          </div>

          {/* Bikes - Small */}
          <div className="h-[250px] md:h-auto md:col-span-4 group relative overflow-hidden rounded-[40px] lg:rounded-[60px] cursor-pointer border border-transparent dark:border-white/5" onClick={() => { onNavigate('shop'); }}>
            <img src={categoryImages['Fietsen']} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-12 space-y-2">
              <span className="text-[9px] lg:text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.5em] block translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Urban Mobility</span>
              <h4 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter">Fietsen</h4>
            </div>
          </div>

          {/* Antiek - Large Square-ish */}
          <div className="h-[250px] md:h-auto md:col-span-4 group relative overflow-hidden rounded-[40px] lg:rounded-[60px] cursor-pointer border border-transparent dark:border-white/5" onClick={() => { onNavigate('shop'); }}>
            <img src={categoryImages['Antiek']} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-12 space-y-2">
              <span className="text-[9px] lg:text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.5em] block translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Timeless Pieces</span>
              <h4 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter">Antiek</h4>
            </div>
          </div>

          {/* Gadgets - CTA Style */}
          <div className="h-[200px] md:h-auto md:col-span-4 group relative overflow-hidden rounded-[40px] lg:rounded-[60px] cursor-pointer bg-slate-950 flex items-center justify-center border border-white/5" onClick={() => { onNavigate('shop'); }}>
             <img src={categoryImages['Gadgets']} className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-[2s] group-hover:scale-110" />
             <div className="relative z-10 text-center space-y-4">
               <h4 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter group-hover:text-[#FF4F00] transition-colors">Gadgets</h4>
               <p className="text-[9px] lg:text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Bekijk Alles →</p>
             </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            { title: 'GEVERIFIEERD', desc: 'Elk item handmatig gecontroleerd door Nederlandse experts.', icon: '🛡️' },
            { title: 'SNELLE LOGISTIEK', desc: 'Verzekerde verzending via PostNL of DHL binnen 48 uur.', icon: '🚚' },
            { title: 'VEILIG BETALEN', desc: 'Gegarandeerde transacties via iDEAL e Stripe Connect.', icon: '💳' }
          ].map((item, i) => (
            <div key={i} className="flex gap-6 lg:gap-8 items-center p-8 lg:p-12 bg-white dark:bg-neutral-900 rounded-[40px] lg:rounded-[60px] border border-slate-100 dark:border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-none transition-all group">
              <div className="text-3xl lg:text-4xl grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">
                {item.icon}
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs lg:text-sm font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white group-hover:text-[#FF4F00] dark:group-hover:text-[#FF4F00] transition-colors">{item.title}</h4>
                <p className="text-[10px] lg:text-xs text-slate-400 dark:text-neutral-500 font-medium leading-relaxed max-w-[200px]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sell CTA Banner */}
      <section className="px-6 lg:px-12 pb-20 lg:pb-40">
        <div className="max-w-[1440px] mx-auto bg-[#FF4F00] rounded-[60px] lg:rounded-[80px] p-12 lg:p-32 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 overflow-hidden relative group">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 max-w-2xl space-y-6 lg:space-y-8 text-center lg:text-left">
            <h2 className="text-4xl lg:text-8xl font-[900] text-white tracking-tighter uppercase leading-[0.9] lg:leading-[0.85]">Uw Design <br /> Verdient Beter.</h2>
            <p className="text-white/80 text-lg lg:text-xl font-medium">Verkoop uw hoogwaardige items via onze gecureerde marktplaats e bereik de juiste kopers in heel Europa.</p>
          </div>
          <div className="relative z-10">
            <button onClick={() => onNavigate('sell')} className="px-12 lg:px-20 py-6 lg:py-10 bg-black text-white font-black text-xs lg:text-sm uppercase tracking-[0.3em] lg:tracking-[0.4em] rounded-full hover:bg-white hover:text-[#FF4F00] transition-all transform hover:scale-110 shadow-3xl">Meld je aan</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;