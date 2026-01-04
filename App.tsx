import React, { useState, useEffect } from 'react';
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
import { Product, User, UserRole, CartItem, Address, ProductStatus } from './types';
import { AnalyticsService } from './services/analyticsService';
import HomeView from './components/App/HomeView';
import ShopView from './components/App/ShopView';
import SuccessView from './components/App/SuccessView';
import { mockProducts } from './services/mockData';

type ViewState = 'home' | 'shop' | 'detail' | 'admin' | 'seller-dashboard' | 'buyer-dashboard' | 'sell' | 'sell-onboarding' | 'about' | 'faq' | 'contact' | 'privacy' | 'terms' | 'cookies' | 'checkout' | 'success';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: 'All', condition: 'All', minPrice: 0, maxPrice: 10000, sortBy: 'newest' });
  const [productsData, setProductsData] = useState<{ data: Product[], total: number }>({ data: [], total: 0 });
  
  const { user, loading: authLoading, error: authError, signOut } = useAuth();
  const { cart, loading: cartLoading, addToCart, updateQuantity, removeFromCart, clearCart } = useCart(user?.id || null);

  useEffect(() => {
    // Load mock products for demo
    setProductsData({ data: mockProducts, total: mockProducts.length });
  }, []);

  useEffect(() => {
    AnalyticsService.pageView(view);
  }, [view]);

  useEffect(() => {
    // Redirect to appropriate dashboard after login
    if (user) {
      setIsLoginOpen(false);
      if (user.role === UserRole.ADMIN) {
        setView('admin');
      } else if (user.role === UserRole.SELLER) {
        setView('seller-dashboard');
      } else if (user.role === UserRole.BUYER) {
        setView('buyer-dashboard');
      }
    }
  }, [user]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    console.log('Toggle wishlist for product:', productId);
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
      await clearCart();
      setView('success');
      AnalyticsService.trackEvent('checkout_completed', {
        items_count: cart.length,
        total_amount: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        paymentMethod: paymentMethod
      });
    } catch (error) {
      console.error('Checkout completion error:', error);
    }
  };

  const handleLoginSuccess = async (user: User) => {
    // The useAuth hook handles setting the user
    // We just need to close the modal
    setIsLoginOpen(false);
    AnalyticsService.trackEvent('user_login');
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

  const resetFilters = () => {
    setFilters({ search: '', category: 'All', condition: 'All', minPrice: 0, maxPrice: 10000, sortBy: 'newest' });
  };

  const removeFilter = (key: keyof typeof filters) => {
    if (key === 'category') setFilters({ ...filters, category: 'All' });
    if (key === 'search') setFilters({ ...filters, search: '' });
  };

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
        onDashboard={() => {
          if (user?.role === UserRole.ADMIN) {
            setView('admin');
          } else if (user?.role === UserRole.SELLER) {
            setView('seller-dashboard');
          } else if (user?.role === UserRole.BUYER) {
            setView('buyer-dashboard');
          } else {
            setIsLoginOpen(true);
          }
        }} 
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
          if (!user) {
            setIsLoginOpen(true);
            return;
          }
          setView('checkout');
        }} 
      />
      
      <LoginView 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={handleLoginSuccess} 
      />
      
      <main className="min-h-screen">
        {view === 'home' && (
          <HomeView 
            products={productsData.data} 
            user={user} 
            onViewProduct={navigateToDetail} 
            onAddToCart={handleAddToCart} 
            onToggleWishlist={handleToggleWishlist} 
            onNavigate={setView} 
          />
        )}
        
        {view === 'success' && <SuccessView onNavigate={setView} />}
        
        {view === 'shop' && (
          <ShopView 
            products={productsData.data} 
            filters={filters} 
            user={user} 
            onViewProduct={navigateToDetail} 
            onAddToCart={handleAddToCart} 
            onToggleWishlist={handleToggleWishlist} 
            onFilterChange={setFilters} 
            onResetFilters={resetFilters} 
            onRemoveFilter={removeFilter} 
          />
        )}
        
        {view === 'sell' && <SellInfoPage onStartRegistration={() => setView('sell-onboarding')} />}
        
        {view === 'sell-onboarding' && <SellRegistrationForm onSuccess={() => setView('seller-dashboard')} />}
        
        {view === 'seller-dashboard' && user && <UserDashboard user={user} />}
        
        {view === 'buyer-dashboard' && user && <BuyerDashboard user={user} />}
        
        {view === 'admin' && user && <AdminDashboard />}
        
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
      
      {view !== 'success' && <Footer onNavigate={setView} />}
    </div>
  );
};

export default App;