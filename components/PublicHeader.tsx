
import React, { useState } from 'react';
import Logo from './Branding/Logo';

interface PublicHeaderProps {
  onLogin: () => void;
  onExplore: () => void;
  cartCount?: number;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ onLogin, onExplore, cartCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: 'Marktplaats', onClick: onExplore },
    { name: 'Hoe het werkt', onClick: () => {} },
    { name: 'Over ons', onClick: () => {} },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          {/* New Logo */}
          <div onClick={onExplore}>
            <Logo size="md" variant="orange" />
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-10 text-[13px] font-black uppercase tracking-[0.1em] text-slate-500">
            {navLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={link.onClick} 
                className="hover:text-[#FF4F00] transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF4F00] transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Desktop Auth & Cart Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart Icon */}
            <button className="relative p-3 text-slate-500 hover:text-slate-900 transition-colors mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#FF4F00] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              onClick={onLogin}
              className="px-6 py-3 text-sm font-black text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors"
            >
              Inloggen
            </button>
            <button 
              onClick={onLogin}
              className="px-8 py-3.5 text-sm font-black bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 hover:-translate-y-0.5"
            >
              Start Verkoop
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             {/* Mobile Cart Icon */}
             <button className="relative p-2 text-slate-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF4F00] text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={toggleMenu}
              className="p-3 text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden absolute top-[96px] left-0 w-full bg-white border-b border-slate-100 shadow-2xl transition-all duration-500 ease-in-out transform ${
          isMenuOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-10 opacity-0 invisible'
        }`}
      >
        <div className="px-6 pt-4 pb-10 space-y-4">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                link.onClick();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-6 py-4 text-base font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 hover:text-[#FF4F00] rounded-2xl transition-colors"
            >
              {link.name}
            </button>
          ))}
          <div className="pt-6 grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                onLogin();
                setIsMenuOpen(false);
              }}
              className="px-4 py-4 text-sm font-black text-slate-900 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              Inloggen
            </button>
            <button
              onClick={() => {
                onLogin();
                setIsMenuOpen(false);
              }}
              className="px-4 py-4 text-sm font-black bg-[#FF4F00] text-white rounded-2xl hover:bg-[#E04600] shadow-xl shadow-orange-500/20 transition-all"
            >
              Verkoop
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicHeader;
