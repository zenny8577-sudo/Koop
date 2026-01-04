import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider
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
import { Product, User, UserRole, CartItem, Address, ProductStatus } from './types';
import { AnalyticsService } from './services/analyticsService';
import HomeView from './components/App/HomeView';
import ShopView from './components/App/ShopView';
import SuccessView from './components/App/SuccessView';
import { mockProducts } from './services/mockData';

type ViewState = 'home' | 'shop' | 'detail' | 'admin' | 'seller-dashboard' | 'buyer-dashboard' | 'sell' | 'sell-onboarding' | 'about' | 'faq' | 'contact' | 'privacy' | 'terms' | 'cookies' | 'checkout' | 'success';

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: 'All', condition: 'All', minPrice: 0, maxPrice: 10000, sortBy: 'newest' });
  const [productsData, setProductsData] = useState<{ data: Product[], total: number }>({ data: [], total: 0 });
  
  const { user, loading: authLoading, signOut } = useAuth();
  const { cart, loading: cartLoading, addToCart, updateQuantity, removeFromCart, clearCart } = useCart(user?.id || null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'ACTIVE');

        if (error) throw error;

        if (data && data.length > 0) {
          setProductsData({ data, total: data.length });
        } else {
          setProductsData({ data: mockProducts, total: mockProducts.length });
        }
      } catch (err) {
        console.error("Using Mock Data due to error or empty DB.", err);
        setProductsData({ data: mockProducts, total: mockProducts.length });
      }
    };

    fetchProducts();
  }, []);

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

  // LOGOUT FIX: Force view change and wait for signout
  const handleLogout = async () => {
    setView('home'); // Immediate UI feedback
    await signOut();
    // No need to do anything else, useAuth will update user state to null
  };

  const navigateToDetail = (product: Product) => {
    setSelectedProduct(product);
    setView('detail');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
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
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
        <Navbar 
          onHome={() => setView('home')} 
          onShop={() => setView('shop')} 
          onAdmin={() => setView('admin')} 
          onOpenCart={() => setIsCartOpen(true)} 
          onOpenLogin={() => setIsLoginOpen(true)} 
          onDashboard={() => user ? setView(getDashboardView(user.role)) : setIsLoginOpen(true)} 
          onSell={() => setView('sell')} 
          onLogout={handleLogout} 
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
          {view === 'shop' && <ShopView products={productsData.data} filters={filters} user={user} onViewProduct={navigateToDetail} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} onFilterChange={setFilters} onResetFilters={() => setFilters({ search: '', category: 'All', condition: 'All', minPrice: 0, maxPrice: 10000, sortBy: 'newest' })} onRemoveFilter={(key) => setFilters({...filters, [key]: ''})} />}
          {view === 'sell' && <SellInfoPage onStartRegistration={() => setView('sell-onboarding')} />}
          {view === 'sell-onboarding' && <SellRegistrationForm onSuccess={() => setView('seller-dashboard')} />}
          {view === 'seller-dashboard' && user && <UserDashboard user={user} />}
          {view === 'buyer-dashboard' && user && <BuyerDashboard user={user} />}
          {view === 'admin' && user && <AdminDashboard />}
          {view === 'detail' && selectedProduct && <ProductDetailView product={selectedProduct} user={user} onBack={() => setView('shop')} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} />}
          {(['about', 'faq', 'contact', 'privacy', 'terms', 'cookies'].includes(view)) && <InfoPages type={view as any} />}
        </main>
        
        <Footer onNavigate={(v) => setView(v as ViewState)} />
      </div>
    );
  };

  return renderMainContent();
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;