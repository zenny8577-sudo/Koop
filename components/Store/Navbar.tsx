import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import Logo from '../Branding/Logo';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onHome: () => void;
  onShop: () => void;
  onAdmin: () => void;
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onDashboard: () => void;
  onSell: () => void;
  onLogout: () => void;
  user: User | null;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onHome, onShop, onAdmin, onOpenCart, onOpenLogin, onDashboard, onSell, onLogout, user, cartCount 
}) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const categories = [
    { name: 'Elektronica', icon: '💻' },
    { name: 'Design', icon: '🛋️' },
    { name: 'Fietsen', icon: '🚲' },
    { name: 'Vintage Mode', icon: '🧥' },
    { name: 'Kunst & Antiek', icon: '🎨' },
    { name: 'Gadgets', icon: '🕹️' },
  ];

  return (
    <nav className="sticky top-0 z-[100] bg-white/70 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-100/50 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-24 flex items-center justify-between">
        {/* Logo */}
        <div onClick={onHome} className="cursor-pointer">
          <Logo size="md" variant={theme === 'dark' ? 'light' : 'dark'} />
        </div>

        {/* Navigation */}
        <div className="hidden lg:flex items-center gap-12">
          <button 
            onClick={onHome} 
            className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white hover:text-[#FF4F00] transition-colors"
          >
            Home
          </button>
          
          <div 
            className="relative"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <button 
              onClick={onShop}
              className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2 group py-8"
            >
              Collectie
              <svg 
                className={`w-3 h-3 transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mega Menu Overlay */}
            <div 
              className={`absolute top-full -left-20 w-[640px] bg-white dark:bg-slate-900 rounded-[48px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-white/10 p-10 transition-all duration-500 origin-top ${
                isMegaMenuOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-4'
              }`}
            >
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => { onShop(); setIsMegaMenuOpen(false); }}
                    className="flex items-center gap-6 p-6 rounded-[32px] hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-full shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{cat.name}</h4>
                      <p className="text-[9px] text-[#FF4F00] font-black uppercase tracking-[0.2em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Ontdek Nu</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-900 dark:text-white hover:text-[#FF4F00] transition-colors"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <button 
            onClick={onOpenCart} 
            className="relative p-2 text-slate-900 dark:text-white hover:text-[#FF4F00] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF4F00] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div 
              className="relative"
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <button 
                onClick={onDashboard}
                className="flex items-center gap-3 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#FF4F00] dark:hover:bg-[#FF4F00] dark:hover:text-white transition-all shadow-xl shadow-slate-200 dark:shadow-none"
              >
                Dashboard
              </button>
              
              <div 
                className={`absolute top-full right-0 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 mt-2 py-4 transition-all duration-300 origin-top-right ${
                  isUserMenuOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'
                }`}
              >
                <button onClick={onDashboard} className="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-[#FF4F00] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Overzicht</button>
                {user.role === UserRole.ADMIN && (
                  <button onClick={onAdmin} className="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-[#FF4F00] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Admin Panel</button>
                )}
                <div className="my-2 border-t border-slate-100 dark:border-white/10" />
                <button onClick={onLogout} className="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-white/5 transition-colors">Uitloggen</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button onClick={onOpenLogin} className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white hover:text-[#FF4F00] transition-colors">Inloggen</button>
              <button onClick={onSell} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#FF4F00] dark:hover:bg-[#FF4F00] dark:hover:text-white transition-all shadow-xl">Verkopen</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;