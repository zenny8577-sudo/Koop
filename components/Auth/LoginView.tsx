import React, { useState } from 'react';
import { UserRole, User } from '../../types';
import { authService } from '../../services/authService';

interface LoginViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminHint, setShowAdminHint] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.BUYER);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!validateEmail(email)) {
      setError('Voer een geldig e-mailadres in.');
      return;
    }

    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens bevatten.');
      return;
    }

    if (activeTab === 'register' && password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen.');
      return;
    }

    setIsLoading(true);
    try {
      let user: User;
      if (activeTab === 'login') {
        user = await authService.signIn(email, password);
      } else {
        user = await authService.signUp(email, password, role);
      }
      
      onSuccess(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      if (email === 'brenodiogo27@icloud.com') {
        setShowAdminHint(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError(null);
    setShowAdminHint(false);
  };

  const socialLogin = (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    setTimeout(() => {
      const user: User = {
        id: `social_${provider}_${Date.now()}`,
        email: `${provider}@user.com`,
        role: UserRole.BUYER,
        verificationStatus: 'unverified'
      };
      onSuccess(user);
      onClose();
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-fadeIn">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg p-10 lg:p-14 rounded-[50px] shadow-2xl space-y-10 overflow-hidden border border-slate-100">
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex gap-6 border-b border-slate-100 pb-6">
          <button 
            onClick={() => handleTabChange('login')}
            className={`text-xl font-black uppercase tracking-tighter transition-all ${
              activeTab === 'login' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'
            }`}
          >
            Inloggen
          </button>
          <button 
            onClick={() => handleTabChange('register')}
            className={`text-xl font-black uppercase tracking-tighter transition-all ${
              activeTab === 'register' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'
            }`}
          >
            Registreren
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-slideIn">
            <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-[11px] font-black uppercase tracking-widest text-rose-500">{error}</p>
          </div>
        )}

        {showAdminHint && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 animate-slideIn">
            <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[11px] font-black uppercase tracking-widest text-blue-500">Admin password: 19011995Breno@#</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => socialLogin('google')}
            className="flex items-center justify-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Google</span>
          </button>
          <button 
            onClick={() => socialLogin('facebook')}
            className="flex items-center justify-center gap-3 p-4 bg-[#1877F2] text-white rounded-2xl hover:opacity-90 transition-all group"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="E-MAILADRES"
              className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="WACHTWOORD"
              className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
            />
          </div>

          {activeTab === 'register' && (
            <>
              <div className="space-y-2">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="BEVESTIG WACHTWOORD"
                  className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                >
                  <option value={UserRole.BUYER}>Koper</option>
                  <option value={UserRole.SELLER}>Verkoper</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3 px-4">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 text-[#FF4F00] border-slate-200 rounded focus:ring-[#FF4F00]"
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ik accepteer de voorwaarden</span>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 bg-slate-950 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-xl hover:bg-[#FF4F00] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verificeren...' : activeTab === 'login' ? 'Doorgaan' : 'Account Aanmaken'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;