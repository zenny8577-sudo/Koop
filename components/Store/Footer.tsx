import React from 'react';
import Logo from '../Branding/Logo';
import { useTheme } from '../../context/ThemeContext';

interface FooterProps {
  onNavigate: (view: any) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer className="bg-white dark:bg-black border-t border-slate-100 dark:border-white/5 pt-24 pb-12 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-8">
            <div onClick={() => onNavigate('home')} className="cursor-pointer inline-block">
              <Logo size="md" variant={theme === 'dark' ? 'light' : 'dark'} />
            </div>
            <p className="text-slate-500 dark:text-neutral-400 font-medium leading-relaxed max-w-sm text-base">
              De nummer één premium marktplaats voor geverifieerde tweedehands design en technologie in Nederland. Curated by experts, for experts.
            </p>
            <div className="flex gap-4">
              {['instagram', 'linkedin', 'twitter'].map(social => (
                <a key={social} href="#" className="w-12 h-12 rounded-2xl border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-neutral-500 hover:bg-slate-950 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 hover:border-slate-950 dark:hover:border-white transition-all transform hover:-translate-y-1">
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 bg-current rounded-sm opacity-20" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-2 lg:ml-auto space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-neutral-500">Shop</h4>
            <ul className="space-y-4">
              <li><button onClick={() => onNavigate('shop')} className="text-xs font-bold text-slate-600 dark:text-neutral-300 hover:text-[#FF4F00] dark:hover:text-[#FF4F00] transition-colors uppercase tracking-widest">Collectie</button></li>
              <li><button onClick={() => onNavigate('sell')} className="text-xs font-bold text-slate-600 dark:text-neutral-300 hover:text-[#FF4F00] dark:hover:text-[#FF4F00] transition-colors uppercase tracking-widest">Verkopen</button></li>
              <li><button onClick={() => onNavigate('shop')} className="text-xs font-bold text-slate-600 dark:text-neutral-300 hover:text-[#FF4F00] dark:hover:text-[#FF4F00] transition-colors uppercase tracking-widest">Nieuw Binnen</button></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-neutral-500">Support</h4>
            <ul className="space-y-4">
              <li><button onClick={() => onNavigate('about')} className="text-xs font-bold text-slate-600 dark:text-neutral-300 hover:text-[#FF4F00] dark:hover:text-[#FF4F00] transition-colors uppercase tracking-widest">Over Koop</button></li>
              <li><button onClick={() => onNavigate('faq')} className="text-xs font-bold text-slate-600 dark:text-neutral-300 hover:text-[#FF4F00] dark:hover:text-[#FF4F00] transition-colors uppercase tracking-widest">FAQ</button></li>
              <li><button onClick={() => onNavigate('contact')} className="text-xs font-bold text-slate-600 dark:text-neutral-300 hover:text-[#FF4F00] dark:hover:text-[#FF4F00] transition-colors uppercase tracking-widest">Contact</button></li>
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-neutral-500">Betaal Veilig</h4>
            <div className="flex flex-wrap items-center gap-8 grayscale opacity-20 dark:opacity-40 dark:invert">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/77/IDEAL_Logo.svg" className="h-5" alt="iDEAL" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/PostNL_logo.svg" className="h-6" alt="PostNL" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/DHL_Express_logo.svg" className="h-4" alt="DHL" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
            </div>
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-500 leading-relaxed">
                 Alle betalingen beveiligd door Stripe Connect e iDEAL. 100% kopersbescherming voor elke transactie.
               </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <p className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-[0.2em]">
              © {currentYear} KOOP MARKETPLACE B.V. ALL RIGHTS RESERVED.
            </p>
            
            <a 
              href="https://brenodiogo.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group flex items-center gap-2.5 bg-slate-50/80 dark:bg-white/5 px-4 py-2 rounded-xl hover:bg-slate-950 dark:hover:bg-white transition-all duration-500 border border-slate-100 dark:border-white/5"
            >
              <div className="flex items-center gap-1 text-sky-500 group-hover:text-sky-400 transition-colors">
                <span className="font-black text-[10px]">&lt;</span>
                <span className="font-black text-[10px]">&gt;</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-neutral-300 group-hover:text-white dark:group-hover:text-slate-900 transition-colors">
                ENGINEERED BY <span className="text-slate-950 dark:text-white group-hover:text-sky-400 dark:group-hover:text-sky-600 transition-colors">BRENODIOGO.COM</span>
              </span>
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-10">
            <button onClick={() => onNavigate('privacy')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate('terms')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors">Algemene Voorwaarden</button>
            <button onClick={() => onNavigate('cookies')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;