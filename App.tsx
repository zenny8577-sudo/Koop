import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import Navbar from './components/Store/Navbar';
import Footer from './components/Store/Footer';
import CartDrawer from './components/Store/CartDrawer';
import CheckoutView from './components/Checkout/CheckoutView';
import ProductCard from './components/Products/ProductCard';
import ProductDetailView from './components/Products/ProductDetailView';
import LoginView from './components/Auth/LoginView';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import UserDashboard from './components/Dashboard/UserDashboard';
import BuyerDashboard from './components/Dashboard/BuyerDashboard';
import SellRegistrationForm from './components/Auth/SellRegistrationForm';
import SellInfoPage from './components/Store/SellInfoPage';
import InfoPages from './components/Store/InfoPages';
import ProductList from './components/Products/ProductList';
import { SupabaseService } from './services/supabaseService';
import { Product, User, UserRole, CartItem, Address, ProductStatus } from './types';
import { AnalyticsService } from './services/analyticsService';

type ViewState = 'home' | 'shop' | 'detail' | 'admin' | 'seller-dashboard' | 'buyer-dashboard' | 'sell' | 'sell-onboarding' | 'about' | 'faq' | 'contact' | 'privacy' | 'terms' | 'cookies' | 'checkout' | 'success';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeSpotlight, setActiveSpotlight] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    condition: 'All',
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'newest'
  });
  const [productsData, setProductsData] = useState<{ data: Product[], total: number }>({ data: [], total: 0 });

  const { user, loading: authLoading, error: authError, signIn, signOut } = useAuth();
  const { cart, loading: cartLoading, addToCart, updateQuantity, removeFromCart, clearCart } = useCart(user?.id || null);

  useEffect(() => {
    loadProducts();
    AnalyticsService.pageView(view);
  }, [filters, view]);

  useEffect(() => {
    if (view === 'home') {
      const interval = setInterval(() => {
        setActiveSpotlight(prev => (prev + 1) % 3);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [view]);

  const loadProducts = async () => {
    try {
      const data = await SupabaseService.getProducts(1, 100, filters);
      setProductsData(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    try {
      await SupabaseService.toggleWishlist(user.id, productId);
      // Refresh user data to update wishlist
      const updatedUser = await SupabaseService.getUser(user.id);
      if (updatedUser) {
        // In a real app, you'd update the user state here
        // For now, we'll just reload the products to get fresh data
        loadProducts();
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const item = cart.find(item => item.product.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity + delta);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    removeFromCart(productId);
  };

  const handleCheckoutComplete = async (address: Address, paymentMethod: string) => {
    try {
      // In a real app, you would:
      // 1. Create transactions for each item
      // 2. Clear the cart
      // 3. Send confirmation emails
      // 4. Track analytics

      await clearCart();
      setView('success');
      AnalyticsService.trackEvent('checkout_completed', {
        items_count: cart.length,
        total_amount: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        payment_method: paymentMethod
      });
    } catch (error) {
      console.error('Checkout completion error:', error);
    }
  };

  const handleLoginSuccess = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      setIsLoginOpen(false);
      AnalyticsService.trackEvent('user_login');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setView('home');
      AnalyticsService.trackEvent('user_logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateToDetail = (product: Product) => {
    setSelectedProduct(product);
    setView('detail');
    AnalyticsService.trackEvent('product_view', {
      productId: product.id,
      category: product.category
    });
  };

  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const spotlightProducts = productsData.data.slice(0, 3);
  const recentProducts = productsData.data.slice(10, 14);

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      condition: 'All',
      minPrice: 0,
      maxPrice: 10000,
      sortBy: 'newest'
    });
  };

  const removeFilter = (key: keyof typeof filters) => {
    if (key === 'category') setFilters({ ...filters, category: 'All' });
    if (key === 'search') setFilters({ ...filters, search: '' });
  };

  const categoryImages: Record<string, string> = {
    'Elektronica': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200',
    'Design': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200',
    'Fietsen': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=1200',
    'Antiek': 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=1200',
    'Gadgets': 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=1200'
  };

  const renderHome = () => (
    <div className="space-y-40 pb-60 animate-fadeIn overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[95vh] flex items-center px-6 lg:px-24 mx-4 lg:mx-12 rounded-[60px] lg:rounded-[120px] overflow-hidden bg-slate-950 mt-8 group">
        <div className="absolute inset-0 z-0 scale-105 group-hover:scale-100 transition-transform duration-[3s] ease-out">
          <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=90&w=2400" className="w-full h-full object-cover opacity-50" alt="Dutch Tech Design" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-5xl space-y-14">
          <div className="space-y-4">
            <span className="inline-block px-5 py-2.5 bg-[#FF4F00]/10 text-[#FF4F00] text-[11px] font-black uppercase tracking-[0.4em] rounded-full border border-[#FF4F00]/20 backdrop-blur-md">The Dutch Premium Standard</span>
            <h1 className="text-7xl lg:text-[160px] font-black text-white leading-[0.8] tracking-tighter uppercase">RE-OWNED <br /> <span className="text-[#FF4F00]">MASTERPIECES.</span></h1>
          </div>
          <p className="text-white/60 text-xl lg:text-2xl font-medium max-w-2xl leading-relaxed">Amsterdam's most exclusive marketplace for geverifieerde tech e designer furniture. Curated by experts, delivered with care.</p>
          <div className="flex flex-wrap gap-8 pt-6">
            <button onClick={() => setView('shop')} className="px-16 py-8 bg-[#FF4F00] text-white font-black text-xs uppercase tracking-[0.3em] rounded-[32px] hover:bg-white hover:text-slate-950 transition-all transform hover:-translate-y-2 shadow-2xl shadow-orange-500/20">Shop de Collectie</button>
            <button onClick={() => setView('sell')} className="px-16 py-8 bg-white/5 backdrop-blur-xl text-white border border-white/10 font-black text-xs uppercase tracking-[0.3em] rounded-[32px] hover:bg-white/10 transition-all">Start Verkoop</button>
          </div>
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">Vers uit curatie</span>
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase">Nieuwe Items<span className="text-[#FF4F00]">.</span></h2>
          </div>
          <button onClick={() => setView('shop')} className="hidden md:block text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-[#FF4F00] transition-colors border-b-2 border-slate-100 hover:border-[#FF4F00] pb-2">Bekijk alles →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {recentProducts.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={navigateToDetail}
              onAddToCart={handleAddToCart}
              isWishlisted={user?.wishlist?.includes(p.id)}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      </section>

      {/* Spotlight Carousel */}
      <section className="px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto space-y-12">
           <div className="flex justify-between items-end">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">Exclusieve Curatie</span>
                <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase">Product Spotlight<span className="text-[#FF4F00]">.</span></h2>
              </div>
              <div className="flex gap-3">
                 {spotlightProducts.map((_, i) => (
                   <button
                     key={i}
                     onClick={() => setActiveSpotlight(i)}
                     className={`h-1.5 transition-all duration-500 rounded-full ${activeSpotlight === i ? 'bg-[#FF4F00] w-12' : 'bg-slate-200 w-4'}`}
                   />
                 ))}
              </div>
           </div>

           <div className="relative h-[600px] lg:h-[700px] overflow-hidden rounded-[80px] group">
              {spotlightProducts.map((product, i) => (
                <div
                  key={product.id}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${activeSpotlight === i ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-full scale-110 pointer-events-none'}`}
                >
                   <ProductCard
                     product={product}
                     variant="featured"
                     onClick={navigateToDetail}
                     onAddToCart={handleAddToCart}
                     isWishlisted={user?.wishlist?.includes(product.id)}
                     onToggleWishlist={handleToggleWishlist}
                   />
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Category Explorer */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">Navigeer per Stijl</span>
            <h2 className="text-5xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-none">Ontdek <br /> Collecties<span className="text-[#FF4F00]">.</span></h2>
          </div>
          <p className="text-slate-500 font-medium max-w-sm text-lg leading-relaxed">Onze curators hebben de meest exclusieve items voor u geselecteerd, gecategoriseerd op esthetiek en vakmanschap.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[1000px] lg:h-[800px]">
          {/* Tech - Wide */}
          <div className="md:col-span-8 group relative overflow-hidden rounded-[60px] cursor-pointer" onClick={() => { setFilters({...filters, category: 'Elektronica'}); setView('shop'); }}>
            <img src={categoryImages['Elektronica']} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-12 left-12 space-y-2">
              <span className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.5em] block translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Premium Tech</span>
              <h4 className="text-5xl font-black text-white uppercase tracking-tighter">Elektronica</h4>
            </div>
          </div>

          {/* Design - Tall */}
          <div className="md:col-span-4 group relative overflow-hidden rounded-[60px] cursor-pointer" onClick={() => { setFilters({...filters, category: 'Design'}); setView('shop'); }}>
            <img src={categoryImages['Design']} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-12 left-12 space-y-2">
              <span className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.5em] block translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Living Interior</span>
              <h4 className="text-5xl font-black text-white uppercase tracking-tighter">Design</h4>
            </div>
          </div>

          {/* Bikes - Small */}
          <div className="md:col-span-4 group relative overflow-hidden rounded-[60px] cursor-pointer" onClick={() => { setFilters({...filters, category: 'Fietsen'}); setView('shop'); }}>
            <img src={categoryImages['Fietsen']} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-12 left-12 space-y-2">
              <span className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.5em] block translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Urban Mobility</span>
              <h4 className="text-5xl font-black text-white uppercase tracking-tighter">Fietsen</h4>
            </div>
          </div>

          {/* Antiek - Large Square-ish */}
          <div className="md:col-span-4 group relative overflow-hidden rounded-[60px] cursor-pointer" onClick={() => { setFilters({...filters, category: 'Antiek'}); setView('shop'); }}>
            <img src={categoryImages['Antiek']} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-12 left-12 space-y-2">
              <span className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.5em] block translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Timeless Pieces</span>
              <h4 className="text-5xl font-black text-white uppercase tracking-tighter">Antiek</h4>
            </div>
          </div>

          {/* Gadgets - CTA Style */}
          <div className="md:col-span-4 group relative overflow-hidden rounded-[60px] cursor-pointer bg-slate-950 flex items-center justify-center border border-white/5" onClick={() => { setFilters({...filters, category: 'Gadgets'}); setView('shop'); }}>
             <img src={categoryImages['Gadgets']} className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-[2s] group-hover:scale-110" />
             <div className="relative z-10 text-center space-y-4">
               <h4 className="text-4xl font-black text-white uppercase tracking-tighter group-hover:text-[#FF4F00] transition-colors">Gadgets</h4>
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Bekijk Alles →</p>
             </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'GEVERIFIEERD', desc: 'Elk item handmatig gecontroleerd door Nederlandse experts.', icon: '🛡️' },
            { title: 'SNELLE LOGISTIEK', desc: 'Verzekerde verzending via PostNL of DHL binnen 48 uur.', icon: '🚚' },
            { title: 'VEILIG BETALEN', desc: 'Gegarandeerde transacties via iDEAL e Stripe Connect.', icon: '💳' }
          ].map((item, i) => (
            <div key={i} className="flex gap-8 items-center p-12 bg-white rounded-[60px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all group">
              <div className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">
                {item.icon}
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-black uppercase tracking-[0.15em] text-slate-900 group-hover:text-[#FF4F00] transition-colors">{item.title}</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[200px]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sell CTA Banner */}
      <section className="px-6 lg:px-12 pb-40">
        <div className="max-w-[1440px] mx-auto bg-[#FF4F00] rounded-[80px] p-20 lg:p-32 flex flex-col lg:flex-row items-center justify-between gap-16 overflow-hidden relative group">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 max-w-2xl space-y-8 text-center lg:text-left">
            <h2 className="text-5xl lg:text-8xl font-[900] text-white tracking-tighter uppercase leading-[0.85]">Uw Design <br /> Verdient Beter.</h2>
            <p className="text-white/80 text-xl font-medium">Verkoop uw hoogwaardige items via onze gecureerde marktplaats e bereik de juiste kopers in heel Europa.</p>
          </div>
          <div className="relative z-10">
            <button onClick={() => setView('sell')} className="px-20 py-10 bg-slate-950 text-white font-black text-sm uppercase tracking-[0.4em] rounded-full hover:bg-white hover:text-[#FF4F00] transition-all transform hover:scale-110 shadow-3xl">Meld je aan</button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderSuccess = () => (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
      <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-xl mb-14">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </div>
      <h2 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase mb-8">Succes!</h2>
      <p className="text-slate-500 max-w-sm mx-auto font-medium text-lg mb-16 uppercase tracking-widest">Je bestelling wordt verwerkt.</p>
      <div className="flex gap-4">
        <button onClick={() => setView('home')} className="px-16 py-8 bg-white border-2 border-slate-950 text-slate-950 font-black rounded-full uppercase tracking-widest text-[12px] hover:bg-slate-950 hover:text-white transition-all">Terug naar Home</button>
        <button onClick={() => setView('buyer-dashboard')} className="px-16 py-8 bg-slate-950 text-white font-black rounded-full uppercase tracking-widest text-[12px] hover:bg-[#FF4F00] transition-all shadow-2xl">Bekijk Bestelling</button>
      </div>
    </div>
  );

  if (authLoading || cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4F00]"></div>
      </div>
    );
  }

  if (view === 'checkout') {
    return <CheckoutView items={cart} onBack={() => setView('shop')} onComplete={handleCheckoutComplete} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        onHome={() => setView('home')}
        onShop={() => setView('shop')}
        onAdmin={() => setView('admin')}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onDashboard={() => setView(user?.role === UserRole.ADMIN ? 'admin' : user?.role === UserRole.SELLER ? 'seller-dashboard' : 'buyer-dashboard')}
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
        onCheckout={() => { setIsCartOpen(false); setView('checkout'); }}
      />
      <LoginView
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <main className="min-h-screen">
        {view === 'home' && renderHome()}
        {view === 'success' && renderSuccess()}
        {view === 'shop' && (
           <div className="max-w-[1600px] mx-auto px-6 py-24 animate-fadeIn flex flex-col lg:flex-row gap-20">
              <aside className="w-full lg:w-96 shrink-0 space-y-16">
                <div className="space-y-6">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Refine Search</h3>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="PRODUCT, SKU OF TAGS..."
                      value={filters.search}
                      onChange={e => setFilters({...filters, search: e.target.value})}
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
                      <button onClick={() => setFilters({...filters, category: 'All'})} className="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest border-b border-[#FF4F00]">Reset</button>
                    )}
                  </div>
                  <div className="flex flex-col gap-6">
                    {['All', ...Object.keys(categoryImages)].map(c => (
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

                {/* Price Range */}
                <div className="space-y-10">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Prijs Range</h3>
                  <div className="px-2 space-y-8">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Min.</p><p className="text-sm font-black text-slate-900">€ 0</p></div>
                      <div className="text-right space-y-1"><p className="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest">Max.</p><p className="text-xl font-black text-[#FF4F00]">€ {filters.maxPrice.toLocaleString()}</p></div>
                    </div>
                    <input type="range" min="0" max="10000" step="100" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#FF4F00]" />
                  </div>
                </div>

                <div className="p-10 bg-slate-950 rounded-[50px] space-y-6 text-white overflow-hidden relative shadow-3xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4F00] blur-[80px] opacity-20" />
                   <h4 className="text-xl font-black uppercase tracking-tighter relative z-10">Hulp Nodig?</h4>
                   <p className="text-white/60 text-sm font-medium relative z-10 leading-relaxed">Onze curators staan klaar om al uw perguntas te beantwoorden.</p>
                   <button onClick={() => setView('contact')} className="w-full py-5 bg-white text-slate-950 font-black rounded-3xl uppercase tracking-widest text-[10px] relative z-10 hover:bg-[#FF4F00] hover:text-white transition-all">Stuur Bericht</button>
                </div>
              </aside>

              <div className="flex-1 space-y-12">
                {/* Shop Header & Sort */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Resultaten <span className="text-slate-400">({productsData.total})</span></h2>
                    <div className="flex flex-wrap gap-2">
                      {filters.category !== 'All' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 animate-fadeIn">
                          {filters.category}
                          <button onClick={() => removeFilter('category')} className="hover:text-[#FF4F00]">×</button>
                        </div>
                      )}
                      {filters.search && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 animate-fadeIn">
                          "{filters.search}"
                          <button onClick={() => removeFilter('search')} className="hover:text-[#FF4F00]">×</button>
                        </div>
                      )}
                      {(filters.category !== 'All' || filters.search) && (
                        <button onClick={resetFilters} className="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest hover:underline ml-2">Wis alles</button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sorteer op:</span>
                    <select
                      value={filters.sortBy}
                      onChange={e => setFilters({...filters, sortBy: e.target.value})}
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
                  {productsData.data.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onClick={navigateToDetail}
                      onAddToCart={handleAddToCart}
                      isWishlisted={user?.wishlist?.includes(p.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>

                {productsData.data.length === 0 && (
                  <div className="py-40 text-center space-y-8 bg-slate-50 rounded-[60px] border border-dashed border-slate-200 animate-fadeIn">
                    <div className="text-8xl grayscale opacity-20">🔍</div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Geen items gevonden</h3>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Probeer andere zoekwoorden of wis de filters.</p>
                    </div>
                    <button onClick={resetFilters} className="px-10 py-5 bg-slate-950 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl">Filters Wissen</button>
                  </div>
                )}
              </div>
           </div>
        )}
        {view === 'sell' && <SellInfoPage onStartRegistration={() => setView('sell-onboarding')} />}
        {view === 'sell-onboarding' && <SellRegistrationForm onSuccess={() => setView('seller-dashboard')} />}
        {view === 'seller-dashboard' && <UserDashboard />}
        {view === 'buyer-dashboard' && user && <BuyerDashboard user={user} />}
        {view === 'admin' && <AdminDashboard />}
        {view === 'detail' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            user={user}
            onBack={() => setView('shop')}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
          />
        )}
        {(['about', 'faq', 'contact', 'privacy', 'terms', 'cookies'].includes(view)) && <InfoPages type={view as any} />}
      </main>
      {view !== 'success' && <Footer onNavigate={(v) => setView(v)} />}
    </div>
  );
};

export default App;