
import React, { useState } from 'react';
import { User, UserRole } from '../../types';

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

  const categories = [
    { name: 'Elektronica', icon: '💻' },
    { name: 'Design', icon: '🛋️' },
    { name: 'Fietsen', icon: '🚲' },
    { name: 'Vintage Mode', icon: '🧥' },
    { name: 'Kunst & Antiek', icon: '🎨' },
    { name: 'Gadgets', icon: '🕹️' },
  ];

  return (
    <nav className="sticky top-0 z-[100] bg-white/70 backdrop-blur-2xl border-b border-slate-100/50">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-24 flex items-center justify-between">
        {/* Logo */}
        <div onClick={onHome} className="cursor-pointer group flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF4F00] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500">
            <span className="text-white font-black text-xl">K</span>
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">KOOP<span className="text-[#FF4F00]">.</span></span>
        </div>

        {/* Navigation */}
        <div className="hidden lg:flex items-center gap-12">
          <button onClick={onHome} className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-[#FF4F00] transition-colors">Home</button>
          
          <div className="relative" onMouseEnter={() => setIsMegaMenuOpen(true)} onMouseLeave={() => setIsMegaMenuOpen(false)}>
            <button onClick={onShop} className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 group py-8">
              Collectie
              <svg className={`w-3 h-3 transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mega Menu Overlay */}
            <div className={`absolute top-full -left-20 w-[640px] bg-white rounded-[48px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-10 transition-all duration-500 origin-top ${isMegaMenuOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-4'}`}>
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

          <button onClick={onSell} className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-[#FF4F00] transition-colors">Verkopen bij ons</button>
          
          {user?.role === UserRole.ADMIN && (
            <button onClick={onAdmin} className="text-[11px] font-black uppercase tracking-widest text-[#FF4F00] bg-orange-50 px-4 py-2 rounded-full border border-orange-100 hover:bg-[#FF4F00] hover:text-white transition-all">Admin Panel</button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-8">
          <div className="relative" onMouseEnter={() => setIsUserMenuOpen(true)} onMouseLeave={() => setIsUserMenuOpen(false)}>
            <button onClick={user ? onDashboard : onOpenLogin} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 py-4">
              <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center overflow-hidden bg-slate-50">
                {user ? (
                  <img src={`https://ui-avatars.com/api/?name=${user.email}&background=FF4F00&color=fff`} className="w-full h-full" alt="User" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )}
              </div>
              {user ? 'Mijn Account' : 'Inloggen'}
            </button>

            {user && (
              <div className={`absolute top-full right-0 w-48 bg-white rounded-3xl shadow-xl border border-slate-100 p-4 transition-all duration-300 origin-top ${isUserMenuOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'}`}>
                <button onClick={onDashboard} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">Dashboard</button>
                <button onClick={onLogout} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-all">Uitloggen</button>
              </div>
            )}
          </div>

          <button onClick={onOpenCart} className="relative group">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white transform transition-transform group-hover:-translate-y-1 shadow-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 11-8 0m-4 7v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2m4 6V7a4 4 0 018 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF4F00] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
