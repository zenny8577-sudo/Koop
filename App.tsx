import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import Navbar from './components/Store/Navbar';
import Footer from './components/Store/Footer';
import CartDrawer from './components/Store/CartDrawer';
import CheckoutView from './components/Checkout/CheckoutView';
import ProductDetailView from './components/Products/ProductDetailView';
import LoginView from './components/Auth/LoginView';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import UserDashboard from './components/Dashboard/UserDashboard';
import BuyerDashboard from './components/Dashboard/BuyerDashboard';
import SellRegistrationForm from './components/Auth/SellRegistrationForm';
import SellInfoPage from './components/Store/SellInfoPage';
import InfoPages from './components/Store/InfoPages';
import { supabase } from './src/integrations/supabase/client';
import { Product, User, Address } from './types';
import { AnalyticsService } from './services/analyticsService';
import HomeView from './components/App/HomeView';
import ShopView from './components/App/ShopView';
import SuccessView from './components/App/SuccessView';
import { mockProducts } from './services/mockData';
import { Toaster } from 'react-hot-toast';

type ViewState = 'home' | 'shop' | 'detail' | 'admin' | 'seller-dashboard' | 'buyer-dashboard' | 'sell' | 'sell-onboarding' | 'about' | 'faq' | 'contact' | 'privacy' | 'terms' | 'cookies' | 'checkout' | 'success';

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: 'All', condition: 'All', minPrice: 0, maxPrice: 10000, sortBy: 'newest', subcategory: '' });
  const [productsData, setProductsData] = useState<{ data: Product[], total: number }>({ data: [], total: 0 });
  
  const { user, loading: authLoading, signOut } = useAuth();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } = useCart(user?.id || null);

  // Função centralizada para recarregar dados sem F5
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let allProducts = data || [];

      // DEDUPLICAÇÃO INTELIGENTE (SHOP):
      // Mistura produtos reais com mocks, mas remove mocks se o título já existir nos reais.
      if (allProducts.length < 20) {
          const realTitles = new Set(allProducts.map(p => p.title.trim().toLowerCase()));
          const realIds = new Set(allProducts.map(p => p.id));
          
          const mocksToAdd = mockProducts.filter(m => {
             // Só adiciona mocks ATIVOS na loja
             if (m.status !== 'ACTIVE') return false;
             
             const titleExists = realTitles.has(m.title.trim().toLowerCase());
             const idExists = realIds.has(m.id);
             return !titleExists && !idExists;
          });
          
          allProducts = [...allProducts, ...mocksToAdd];
      }

      setProductsData({ data: allProducts, total: allProducts.length });

    } catch (err) {
      console.error("Using Mock Data due to error or empty DB.", err);
      setProductsData({ data: mockProducts, total: mockProducts.length });
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    AnalyticsService.pageView(view);
    window.scrollTo(0, 0);
  }, [view]);

  const getDashboardView = (role: string | undefined): ViewState => {
    const r = (role || 'BUYER').toUpperCase();
    if (r === 'ADMIN') return 'admin';
    if (r === 'SELLER') return 'seller-dashboard';
    return 'buyer-dashboard';
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
    console.log('Wishlist toggle:', productId);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const item = cart.find(item => item.product.id === productId);
    if (item) item && updateQuantity(productId, item.quantity + delta);
  };

  const handleCheckoutComplete = async (address: Address, paymentMethod: string) => {
    await clearCart();
    setView('success');
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setIsLoginOpen(false);
    const nextView = getDashboardView(loggedInUser.role);
    setView(nextView);
  };

  const handleLogout = async () => {
    setView('home'); 
    await signOut();
  };

  const navigateToDetail = (product: Product) => {
    if (!product) return;
    setSelectedProduct(product);
    setView('detail');
  };

  // Prevent infinite loading screen if auth hangs, but allow UI to show if we have data or partial state
  if (authLoading && !productsData.data.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center space-y-4">
           <div className="w-16 h-16 border-4 border-[#FF4F00] border-t-transparent rounded-full animate-spin mx-auto"></div>
           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Koop...</p>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    if (view === 'checkout') return <CheckoutView items={cart} onBack={() => setView('shop')} onComplete={handleCheckoutComplete} />;
    if (view === 'success') return <SuccessView onNavigate={(v) => setView(v as ViewState)} />;
    
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Toaster position="top-center" toastOptions={{
          className: '',
          style: {
            border: '1px solid #F1F5F9',
            padding: '16px',
            color: '#0F172A',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600'
          },
        }} />
        <Navbar 
          onHome={() => setView('home')} 
          onShop={() => setView('shop')} 
          onAdmin={() => setView('admin')} 
          onOpenCart={() => setIsCartOpen(true)} 
          onOpenLogin={() => setIsLoginOpen(true)} 
          onDashboard={() => user ? setView(getDashboardView(user.role)) : setIsLoginOpen(true)} 
          onSell={() => setView('sell')} 
          onLogout={handleLogout} 
          onWishlist={() => setView('shop')}
          user={user} 
          cartCount={cart.reduce((acc, item) => acc + (item.quantity || 0), 0)} 
        />
        
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          items={cart} 
          onUpdateQuantity={handleUpdateQuantity} 
          onRemove={removeFromCart} 
          onCheckout={() => {
            setIsCartOpen(false);
            user ? setView('checkout') : setIsLoginOpen(true);
          }} 
        />
        
        <LoginView 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
          onSuccess={handleLoginSuccess} 
        />
        
        <main className="min-h-screen">
          {view === 'home' && <HomeView products={productsData.data} user={user} onViewProduct={navigateToDetail} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} onNavigate={(v) => setView(v as ViewState)} />}
          {view === 'shop' && <ShopView products={productsData.data} filters={filters} user={user} onViewProduct={navigateToDetail} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} onFilterChange={setFilters} onResetFilters={() => setFilters({ search: '', category: 'All', condition: 'All', minPrice: 0, maxPrice: 10000, sortBy: 'newest', subcategory: '' })} onRemoveFilter={(key) => setFilters({...filters, [key]: ''})} />}
          {view === 'sell' && <SellInfoPage onStartRegistration={() => setView('sell-onboarding')} />}
          {view === 'sell-onboarding' && <SellRegistrationForm onSuccess={() => setView('seller-dashboard')} />}
          {view === 'seller-dashboard' && user && <UserDashboard user={user} />}
          {view === 'buyer-dashboard' && user && <BuyerDashboard user={user} />}
          
          {/* Admin Dashboard recebe função de refresh para atualizar loja em tempo real */}
          {view === 'admin' && user && <AdminDashboard onDataChange={fetchProducts} />}
          
          {view === 'detail' && selectedProduct ? (
             <ProductDetailView product={selectedProduct} user={user} onBack={() => setView('shop')} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} />
          ) : view === 'detail' && !selectedProduct ? (
             // Fallback caso refresh na página de detalhes perca o estado
             <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <p>Product niet gevonden.</p>
                <button onClick={() => setView('shop')} className="text-[#FF4F00] underline mt-4">Terug naar winkel</button>
             </div>
          ) : null}

          {(['about', 'faq', 'contact', 'privacy', 'terms', 'cookies'].includes(view)) && <InfoPages type={view as any} />}
        </main>
        
        <Footer onNavigate={(v) => setView(v as ViewState)} />
      </div>
    );
  };

  return renderMainContent();
};

const App: React.FC = () => (
  <AppContent />
);

export default App;