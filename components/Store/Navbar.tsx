import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import Logo from '../Branding/Logo';
import { useLanguage } from '../../context/LanguageContext';

interface NavbarProps {
  onHome: () => void;
  onShop: () => void;
  onAdmin: () => void;
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onDashboard: () => void;
  onSell: () => void;
  onLogout: () => void;
  onWishlist: () => void;
  user: User | null;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onHome, onShop, onAdmin, onOpenCart, onOpenLogin, onDashboard, onSell, onLogout, onWishlist, user, cartCount 
}) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentLanguage, switchLanguage } = useLanguage();

  const categories = [
    { name: 'Elektronica', icon: '💻' },
    { name: 'Design', icon: '🛋️' },
    { name: 'Fietsen', icon: '🚲' },
    { name: 'Vintage Mode', icon: '🧥' },
    { name: 'Kunst & Antiek', icon: '🎨' },
    { name: 'Gadgets', icon: '🕹️' },
  ];

  const handleMobileNav = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-slate-100/50 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 lg:h-24 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 -ml-2 text-slate-900"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          {/* Logo */}
          <div onClick={onHome} className="cursor-pointer">
            <Logo size="md" variant="dark" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-12">
            <button 
              onClick={onHome} 
              className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-[#FF4F00] transition-colors"
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
                className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 group py-8"
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
                className={`absolute top-full -left-20 w-[640px] bg-white rounded-[48px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-10 transition-all duration-500 origin-top ${
                  isMegaMenuOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-4'
                }`}
              >
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => { onShop(); setIsMegaMenuOpen(false); }}
                      className="flex items-center gap-6 p-6 rounded-[32px] hover:bg-slate-50 transition-all text-left group"
                    >
                      <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                        {cat.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{cat.name}</h4>
                        <p className="text-[9px] text-[#FF4F00] font-black uppercase tracking-[0.2em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Ontdek Nu</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Language Switcher */}
            <div className="hidden lg:flex items-center bg-slate-50 rounded-full p-1 border border-slate-100">
              <button 
                onClick={() => switchLanguage('nl')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${currentLanguage === 'nl' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                NL
              </button>
              <button 
                onClick={() => switchLanguage('en')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${currentLanguage === 'en' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                EN
              </button>
            </div>

            <button 
              onClick={onWishlist}
              className="hidden sm:block p-2 text-slate-900 hover:text-[#FF4F00] transition-colors"
              title="Favorieten"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <button 
              onClick={onOpenCart} 
              className="relative p-2 text-slate-900 hover:text-[#FF4F00] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF4F00] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div 
                className="relative hidden lg:block"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <button 
                  onClick={onDashboard}
                  className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#FF4F00] transition-all shadow-xl shadow-slate-200"
                >
                  Dashboard
                </button>
                
                <div 
                  className={`absolute top-full right-0 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 mt-2 py-4 transition-all duration-300 origin-top-right ${
                    isUserMenuOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'
                  }`}
                >
                  <button onClick={onDashboard} className="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#FF4F00] hover:bg-slate-50 transition-colors">Overzicht</button>
                  {user.role === UserRole.ADMIN && (
                    <button onClick={onAdmin} className="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#FF4F00] hover:bg-slate-50 transition-colors">Admin Panel</button>
                  )}
                  <div className="my-2 border-t border-slate-100" />
                  <button onClick={onLogout} className="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors">Uitloggen</button>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-4">
                <button onClick={onOpenLogin} className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-[#FF4F00] transition-colors">Inloggen</button>
                <button onClick={onSell} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#FF4F00] transition-all shadow-xl">Verkopen</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[200] bg-white transform transition-transform duration-500 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-between items-center mb-12">
            <Logo size="md" variant="dark" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 text-slate-400 hover:text-slate-900"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-8">
            <div className="space-y-4">
              <button onClick={() => handleMobileNav(onHome)} className="block w-full text-left text-3xl font-black text-slate-900 uppercase tracking-tighter hover:text-[#FF4F00]">Home</button>
              <button onClick={() => handleMobileNav(onShop)} className="block w-full text-left text-3xl font-black text-slate-900 uppercase tracking-tighter hover:text-[#FF4F00]">Collectie</button>
              <button onClick={() => handleMobileNav(onSell)} className="block w-full text-left text-3xl font-black text-slate-900 uppercase tracking-tighter hover:text-[#FF4F00]">Verkopen</button>
            </div>

            <div className="border-t border-slate-100 pt-8 space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Taal</p>
                <div className="flex bg-slate-50 rounded-full p-1">
                  <button 
                    onClick={() => switchLanguage('nl')}
                    className={`px-4 py-2 rounded-full text-[10px] font-black ${currentLanguage === 'nl' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                  >
                    NL
                  </button>
                  <button 
                    onClick={() => switchLanguage('en')}
                    className={`px-4 py-2 rounded-full text-[10px] font-black ${currentLanguage === 'en' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                  >
                    EN
                  </button>
                </div>
              </div>
              
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-8">Categorieën</p>
              <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
                  <button 
                    key={cat.name}
                    onClick={() => handleMobileNav(onShop)}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div className="text-sm font-bold">{user.firstName || user.email}</div>
                </div>
                <button onClick={() => handleMobileNav(onDashboard)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Dashboard</button>
                <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full py-4 bg-white border-2 border-slate-100 text-rose-500 rounded-2xl font-black uppercase tracking-widest text-xs">Uitloggen</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleMobileNav(onOpenLogin)} className="py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs">Inloggen</button>
                <button onClick={() => handleMobileNav(onSell)} className="py-4 bg-[#FF4F00] text-white rounded-2xl font-black uppercase tracking-widest text-xs">Registreren</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;