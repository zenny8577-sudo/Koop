import React from 'react';
import { ICONS } from '../constants';
import { UserRole } from '../types';
import Logo from './Branding/Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  onLogout: () => void;
  cartCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userRole, onLogout, cartCount = 0 }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-80 bg-slate-900 text-white p-10 sticky top-0 h-screen">
        <div className="mb-14">
          <Logo variant="light" size="md" />
        </div>

        <nav className="space-y-3 flex-1">
          {/* Admin Navigation - Only visible to ADMIN */}
          {userRole === UserRole.ADMIN && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'admin' ? 'bg-[#FF4F00] text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {ICONS.ADMIN}
              <span className="font-bold">Platform Overzicht</span>
            </button>
          )}

          {/* Seller Navigation - Only visible to SELLER */}
          {userRole === UserRole.SELLER && (
            <>
              <button
                onClick={() => setActiveTab('user-dashboard')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'user-dashboard' ? 'bg-[#FF4F00] text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {ICONS.DASHBOARD}
                <span className="font-bold">Mijn Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('woocommerce')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'woocommerce' ? 'bg-[#FF4F00] text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {ICONS.WCO}
                <span className="font-bold">WooCommerce Sync</span>
              </button>
            </>
          )}

          {/* Buyer Navigation - Only visible to BUYER */}
          {userRole === UserRole.BUYER && (
            <button
              onClick={() => setActiveTab('buyer-dashboard')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'buyer-dashboard' ? 'bg-[#FF4F00] text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {ICONS.CART}
              <span className="font-bold">Mijn Aankopen</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'products' ? 'bg-[#FF4F00] text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            {ICONS.TAG}
            <span className="font-bold">Marktplaats</span>
          </button>
          
          {/* Cart Indicator in Menu */}
          <button
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all text-slate-400 hover:text-white hover:bg-white/5`}
          >
            <div className="flex items-center gap-4">
              {ICONS.CART}
              <span className="font-bold">Winkelwagen</span>
            </div>
            {cartCount > 0 && (
              <span className="bg-[#FF4F00] text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </nav>

        <div className="pt-10 space-y-4 border-t border-white/5">
          <div className="flex items-center gap-4 px-4 py-4 bg-white/5 rounded-3xl border border-white/5">
            <div className="w-12 h-12 rounded-full border-2 border-orange-500 p-0.5 overflow-hidden shadow-xl">
              <img src="https://picsum.photos/seed/user/200/200" className="w-full h-full rounded-full object-cover" alt="User avatar" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate">Sjors de Groot</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">{userRole}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Uitloggen
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <header className="lg:hidden bg-slate-900 text-white p-6 flex items-center justify-between sticky top-0 z-50">
        <Logo variant="light" size="sm" />
        <div className="flex items-center gap-2">
          {cartCount > 0 && (
            <div className="relative mr-2">
               {ICONS.CART}
               <span className="absolute -top-2 -right-2 bg-[#FF4F00] text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-slate-900">
                  {cartCount}
                </span>
            </div>
          )}
          <button onClick={onLogout} className="text-rose-400 p-2 hover:bg-rose-500/10 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        <div className="p-4 lg:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;