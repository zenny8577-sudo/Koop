
import React, { useState, useEffect } from 'react';
import Navbar from './components/Store/Navbar';
import Footer from './components/Store/Footer';
import CartDrawer from './components/Store/CartDrawer';
import CheckoutView from './components/Store/CheckoutView';
import ProductCard from './components/Products/ProductCard';
import ProductDetailView from './components/Products/ProductDetailView';
import LoginView from './components/Auth/LoginView';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import UserDashboard from './components/Dashboard/UserDashboard';
import SellRegistrationForm from './components/Auth/SellRegistrationForm';
import SellInfoPage from './components/Store/SellInfoPage';
import InfoPages from './components/Store/InfoPages';
import { db } from './services/db';
import { Product, User, UserRole, CartItem, Address, ProductStatus } from './types';

type ViewState = 'home' | 'shop' | 'detail' | 'admin' | 'seller-dashboard' | 'sell' | 'sell-onboarding' | 'about' | 'faq' | 'contact' | 'privacy' | 'terms' | 'cookies' | 'checkout' | 'success';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('koop_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('koop_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('koop_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) localStorage.setItem('koop_user', JSON.stringify(user));
    else localStorage.removeItem('koop_user');
  }, [user]);

  // Shop Filters State
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    condition: 'All',
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'newest'
  });

  const [productsData, setProductsData] = useState(db.getProducts(1, 100, filters));

  useEffect(() => {
    setProductsData(db.getProducts(1, 100, filters));
    window.scrollTo(0, 0);
  }, [filters, view]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCheckoutComplete = (address: Address, paymentMethod: string) => {
    setCart([]);
    setView('success');
  };

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    setIsLoginOpen(false);
    if (user.role === UserRole.ADMIN) setView('admin');
    else if (user.role === UserRole.SELLER) setView('seller-dashboard');
    else setView('home');
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const navigateToDetail = (product: Product) => {
    setSelectedProduct(product);
    setView('detail');
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const renderHome = () => (
    <div className="space-y-40 pb-60 animate-fadeIn overflow-hidden">
      {/* Hero Section - Bold & High End */}
      <section className="relative h-[95vh] flex items-center px-6 lg:px-24 mx-4 lg:mx-12 rounded-[60px] lg:rounded-[120px] overflow-hidden bg-slate-950 mt-8 group">
        <div className="absolute inset-0 z-0 scale-105 group-hover:scale-100 transition-transform duration-[3s] ease-out">
          <img 
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=90&w=2400" 
            className="w-full h-full object-cover opacity-50" 
            alt="Dutch Tech Design" 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/20 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-5xl space-y-14">
          <div className="space-y-4">
            <span className="inline-block px-5 py-2.5 bg-[#FF4F00]/10 text-[#FF4F00] text-[11px] font-black uppercase tracking-[0.4em] rounded-full border border-[#FF4F00]/20 backdrop-blur-md">
              The Dutch Premium Standard
            </span>
            <h1 className="text-7xl lg:text-[160px] font-black text-white leading-[0.8] tracking-tighter uppercase">
              RE-OWNED <br /> <span className="text-[#FF4F00]">MASTERPIECES.</span>
            </h1>
          </div>
          
          <p className="text-white/60 text-xl lg:text-2xl font-medium max-w-2xl leading-relaxed">
            Amsterdam's most exclusive marketplace for geverifieerde tech e designer furniture. 
            Curated by experts, delivered with care.
          </p>

          <div className="flex flex-wrap gap-8 pt-6">
            <button 
              onClick={() => setView('shop')} 
              className="px-16 py-8 bg-[#FF4F00] text-white font-black text-xs uppercase tracking-[0.3em] rounded-[32px] hover:bg-white hover:text-slate-950 transition-all transform hover:-translate-y-2 shadow-2xl shadow-orange-500/20"
            >
              Shop de Collectie
            </button>
            <button 
              onClick={() => setView('sell')} 
              className="px-16 py-8 bg-white/5 backdrop-blur-xl text-white border border-white/10 font-black text-xs uppercase tracking-[0.3em] rounded-[32px] hover:bg-white/10 transition-all"
            >
              Start Verkoop
            </button>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-20 right-24 hidden xl:flex gap-16 border-l border-white/10 pl-16 py-4">
          <div>
            <p className="text-4xl font-black text-white tracking-tighter">1.5k+</p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-1">Geverifieerde Items</p>
          </div>
          <div>
            <p className="text-4xl font-black text-white tracking-tighter">€4.2M</p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-1">Verwerkte Waarde</p>
          </div>
        </div>
      </section>

      {/* Featured Collection - Creative Grid */}
      <section className="max-w-[1440px] mx-auto px-6">
        <header className="flex flex-col md:flex-row justify-between items-end gap-10 mb-24">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FF4F00]">Curated Selection</span>
            <h2 className="text-6xl lg:text-8xl font-black text-slate-950 tracking-tighter uppercase leading-[0.9]">
              Nieuwste <br /> <span className="text-[#FF4F00]">Aanwinsten.</span>
            </h2>
          </div>
          <button 
            onClick={() => setView('shop')} 
            className="px-12 py-5 border-2 border-slate-950 text-slate-950 font-black text-[11px] uppercase tracking-[0.3em] rounded-full hover:bg-slate-950 hover:text-white transition-all transform hover:-translate-x-4"
          >
            Alle Producten
          </button>
        </header>

        {/* Bento Box Creative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 min-h-[1200px]">
          {/* Main Featured Item (Top Left) */}
          <div className="lg:col-span-8 lg:row-span-2">
            {productsData.data[0] && (
              <ProductCard 
                variant="featured" 
                product={productsData.data[0]} 
                onClick={navigateToDetail} 
                onAddToCart={handleAddToCart} 
              />
            )}
          </div>
          
          {/* Secondary Featured (Top Right) */}
          <div className="lg:col-span-4 lg:row-span-1">
            {productsData.data[1] && (
              <ProductCard 
                product={productsData.data[1]} 
                onClick={navigateToDetail} 
                onAddToCart={handleAddToCart} 
              />
            )}
          </div>

          {/* Tertiary Featured (Middle Right) */}
          <div className="lg:col-span-4 lg:row-span-1">
            {productsData.data[2] && (
              <ProductCard 
                product={productsData.data[2]} 
                onClick={navigateToDetail} 
                onAddToCart={handleAddToCart} 
              />
            )}
          </div>

          {/* Row 3 - 4 Columns */}
          <div className="lg:col-span-3 lg:row-span-1">
            {productsData.data[3] && (
              <ProductCard 
                product={productsData.data[3]} 
                onClick={navigateToDetail} 
                onAddToCart={handleAddToCart} 
              />
            )}
          </div>
          <div className="lg:col-span-3 lg:row-span-1">
            {productsData.data[4] && (
              <ProductCard 
                product={productsData.data[4]} 
                onClick={navigateToDetail} 
                onAddToCart={handleAddToCart} 
              />
            )}
          </div>
          <div className="lg:col-span-3 lg:row-span-1">
            {productsData.data[5] && (
              <ProductCard 
                product={productsData.data[5]} 
                onClick={navigateToDetail} 
                onAddToCart={handleAddToCart} 
              />
            )}
          </div>
          <div className="lg:col-span-3 lg:row-span-1">
            {productsData.data[6] && (
              <ProductCard 
                product={productsData.data[6]} 
                onClick={navigateToDetail} 
                onAddToCart={handleAddToCart} 
              />
            )}
          </div>
        </div>
      </section>

      {/* Dynamic CTA Banner */}
      <section className="px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto bg-[#FF4F00] rounded-[80px] p-20 lg:p-32 flex flex-col lg:flex-row items-center justify-between gap-16 overflow-hidden relative group">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="relative z-10 max-w-2xl space-y-8 text-center lg:text-left">
            <h2 className="text-5xl lg:text-8xl font-[900] text-white tracking-tighter uppercase leading-[0.85]">
              Uw Design <br /> Verdient Beter.
            </h2>
            <p className="text-white/80 text-xl font-medium">
              Verkoop uw hoogwaardige items via onze gecureerde marktplaats e bereik de juiste kopers in heel Europa.
            </p>
          </div>

          <div className="relative z-10">
            <button 
              onClick={() => setView('sell')}
              className="px-20 py-10 bg-slate-950 text-white font-black text-sm uppercase tracking-[0.4em] rounded-full hover:bg-white hover:text-[#FF4F00] transition-all transform hover:scale-110 shadow-3xl"
            >
              Meld je aan
            </button>
          </div>
        </div>
      </section>

      {/* Experience Section - Redesigned for Higher Visual Quality */}
      <section className="max-w-[1440px] mx-auto px-6 text-center space-y-20">
        <div className="space-y-6">
          <h2 className="text-4xl lg:text-6xl font-black text-slate-950 tracking-tighter uppercase">De Koop Ervaring<span className="text-[#FF4F00]">.</span></h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            Wij zijn meer dan een marktplaats. Wij zijn een community van designliefhebbers die waarde hechten aan kwaliteit, authenticiteit e duurzaamheid.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { 
              label: 'Geverifieerd', 
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              color: "text-blue-500",
              bg: "bg-blue-50"
            },
            { 
              label: 'Verzekerd', 
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              ),
              color: "text-amber-600",
              bg: "bg-amber-50"
            },
            { 
              label: 'NL Local', 
              icon: (
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-8 h-1.5 bg-red-600 rounded-full" />
                  <div className="w-8 h-1.5 bg-white border border-slate-100 rounded-full" />
                  <div className="w-8 h-1.5 bg-blue-700 rounded-full" />
                </div>
              ),
              color: "text-slate-900",
              bg: "bg-slate-50"
            },
            { 
              label: 'Stripe Pay', 
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              color: "text-[#635BFF]",
              bg: "bg-[#635BFF]/5"
            },
          ].map(item => (
            <div key={item.label} className="group flex flex-col items-center gap-6 p-10 rounded-[48px] border border-slate-50 hover:bg-slate-50 transition-all duration-500 hover:scale-105">
              <div className={`w-20 h-20 ${item.bg} ${item.color} rounded-[28px] flex items-center justify-center transition-transform duration-500 group-hover:rotate-6`}>
                {item.icon}
              </div>
              <p className="text-[12px] font-[900] uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-900 transition-colors">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section - Clean & Geometric */}
      <section className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { icon: "🛡️", title: "Gegarandeerde Echtheid", desc: "Elk item wordt fysiek gecontroleerd door technici e experts in ons Amsterdamse depot." },
          { icon: "⚡", title: "Bliksemsnelle Levering", desc: "Verzending via PostNL Verzekerd binnen 48 uur na de kwaliteitscontrole." },
          { icon: "💎", title: "Premium Selectie", desc: "Onze curators selecteren alleen de allerbeste tech e design van geverifieerde verkopers." }
        ].map((item, i) => (
          <div key={i} className="p-12 bg-white rounded-[48px] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl transition-all group">
            <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-[#FF4F00]/5 transition-all">
              {item.icon}
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-950">{item.title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );

  const renderSuccess = () => (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
      <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-xl mb-14">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
      </div>
      <h2 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase mb-8">Succes!</h2>
      <p className="text-slate-500 max-w-sm mx-auto font-medium text-lg mb-16 uppercase tracking-widest">Je bestelling wordt verwerkt.</p>
      <button 
        onClick={() => setView('home')}
        className="px-20 py-8 bg-slate-900 text-white font-black rounded-full uppercase tracking-widest text-[12px] hover:bg-[#FF4F00] transition-all shadow-2xl"
      >
        Terug naar Home
      </button>
    </div>
  );

  if (view === 'checkout') {
    return (
      <CheckoutView 
        items={cart} 
        onBack={() => setView('shop')} 
        onComplete={handleCheckoutComplete} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        onHome={() => setView('home')} 
        onShop={() => setView('shop')} 
        onAdmin={() => setView('admin')} 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenLogin={() => setIsLoginOpen(true)} 
        onDashboard={() => setView(user?.role === UserRole.ADMIN ? 'admin' : 'seller-dashboard')} 
        onSell={() => setView('sell')} 
        onLogout={handleLogout}
        user={user} 
        cartCount={cartCount} 
      />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setView('checkout');
        }}
      />
      <LoginView isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />

      <main className="min-h-screen">
        {view === 'home' && renderHome()}
        {view === 'success' && renderSuccess()}
        {view === 'shop' && (
           <div className="max-w-[1600px] mx-auto px-6 py-24 animate-fadeIn flex flex-col lg:flex-row gap-20">
              <aside className="w-full lg:w-96 shrink-0 space-y-16">
                <div className="space-y-6">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Ontdekking</h3>
                  <input 
                    type="text" 
                    placeholder="ZOEKEN NAAR ITEMS..." 
                    value={filters.search} 
                    onChange={e => setFilters({...filters, search: e.target.value})} 
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-[#FF4F00]/20 rounded-[32px] px-10 py-7 text-sm font-bold outline-none transition-all placeholder:text-slate-300" 
                  />
                </div>
                <div className="space-y-10">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Collecties</h3>
                  <div className="flex flex-col gap-6">
                    {['All', ...db.getCategories()].map(c => (
                      <button 
                        key={c} 
                        onClick={() => setFilters({...filters, category: c})} 
                        className={`text-left text-lg font-black uppercase tracking-tighter transition-all flex items-center justify-between group ${filters.category === c ? 'text-[#FF4F00]' : 'text-slate-400 hover:text-slate-900'}`}
                      >
                        {c}
                        <div className={`w-3 h-3 rounded-full bg-[#FF4F00] transition-all duration-300 ${filters.category === c ? 'scale-100' : 'scale-0 group-hover:scale-50 opacity-20'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-10 bg-slate-950 rounded-[50px] space-y-6 text-white overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4F00] blur-[80px] opacity-20" />
                   <h4 className="text-xl font-black uppercase tracking-tighter relative z-10">Expert Hulp?</h4>
                   <p className="text-white/60 text-sm font-medium relative z-10">Heb je vragen over authenticiteit ou conditie? Onze curators staan klaar.</p>
                   <button onClick={() => setView('contact')} className="w-full py-5 bg-white text-slate-950 font-black rounded-3xl uppercase tracking-widest text-[10px] relative z-10">Stuur Bericht</button>
                </div>
              </aside>
              <div className="flex-1 space-y-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24">
                  {productsData.data.map(p => <ProductCard key={p.id} product={p} onClick={navigateToDetail} onAddToCart={handleAddToCart} />)}
                </div>
                {productsData.data.length === 0 && (
                  <div className="py-40 text-center space-y-8 bg-slate-50 rounded-[60px]">
                    <div className="text-8xl">🔎</div>
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Geen items gevonden</h3>
                    <button onClick={() => setFilters({search: '', category: 'All', condition: 'All', minPrice: 0, maxPrice: 10000, sortBy: 'newest'})} className="text-[#FF4F00] font-black uppercase tracking-widest text-[11px] underline">Filters Wissen</button>
                  </div>
                )}
              </div>
           </div>
        )}
        {view === 'sell' && <SellInfoPage onStartRegistration={() => setView('sell-onboarding')} />}
        {view === 'sell-onboarding' && <SellRegistrationForm onSuccess={() => setView('seller-dashboard')} />}
        {view === 'seller-dashboard' && <UserDashboard />}
        {view === 'admin' && <AdminDashboard />}
        {view === 'detail' && selectedProduct && <ProductDetailView product={selectedProduct} user={user} onBack={() => setView('shop')} />}
        {(['about', 'faq', 'contact', 'privacy', 'terms', 'cookies'].includes(view)) && <InfoPages type={view as any} />}
      </main>

      {view !== 'success' && <Footer onNavigate={(v) => setView(v)} />}
    </div>
  );
};

export default App;
