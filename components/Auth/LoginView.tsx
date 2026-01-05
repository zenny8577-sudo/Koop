import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.BUYER);
  
  // Validation States
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  
  const { signIn, signUp, loading, error: authError } = useAuth();

  useEffect(() => {
    if (email) {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setEmailValid(isValid);
    } else {
      setEmailValid(null);
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 6) strength++;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailValid) {
      toast.error('Voer een geldig e-mailadres in.');
      return;
    }

    if (password.length < 6) {
      toast.error('Wachtwoord moet minimaal 6 tekens bevatten.');
      return;
    }

    if (activeTab === 'register' && password !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen.');
      return;
    }

    try {
      if (activeTab === 'login') {
        const user = await signIn(email, password);
        if (user) {
          toast.success('Succesvol ingelogd!');
          onSuccess(user);
        }
      } else {
        const user = await signUp(email, password, role, firstName, lastName);
        if (user) {
          toast.success('Account aangemaakt! Je bent nu ingelogd.');
          setTimeout(() => {
            onSuccess(user);
            onClose();
          }, 1000);
        }
      }
    } catch (err) {
      // Erro tratado no hook, mas podemos mostrar toast genérico se necessário
      console.error(err);
    }
  };

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setEmailValid(null);
    setPasswordStrength(0);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-fadeIn">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg p-10 lg:p-14 rounded-[50px] shadow-2xl space-y-8 overflow-hidden border border-slate-100">
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

        {authError && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-slideIn">
            <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-[11px] font-black uppercase tracking-widest text-rose-500">{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="E-MAILADRES"
              className={`w-full bg-slate-50 border-2 rounded-2xl px-8 py-5 text-sm font-bold placeholder:text-slate-300 outline-none transition-all ${
                emailValid === false ? 'border-rose-100 focus:border-rose-300' : 
                emailValid === true ? 'border-emerald-100 focus:border-emerald-300' : 
                'border-transparent focus:border-[#FF4F00]/20'
              }`}
            />
            {emailValid === true && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="WACHTWOORD"
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-8 py-5 text-sm font-bold placeholder:text-slate-300 focus:border-[#FF4F00]/20 outline-none transition-all"
            />
            {activeTab === 'register' && password.length > 0 && (
              <div className="flex gap-1 px-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      i <= passwordStrength 
                        ? passwordStrength < 2 ? 'bg-rose-400' 
                        : passwordStrength < 4 ? 'bg-amber-400' 
                        : 'bg-emerald-400' 
                        : 'bg-slate-100'
                    }`} 
                  />
                ))}
              </div>
            )}
          </div>

          {activeTab === 'register' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="VOORNAAM"
                  className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="ACHTERNAAM"
                  className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="BEVESTIG WACHTWOORD"
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-8 py-5 text-sm font-bold placeholder:text-slate-300 outline-none transition-all ${
                    confirmPassword && confirmPassword !== password ? 'border-rose-100' : 'border-transparent'
                  }`}
                />
              </div>
              
              <div className="space-y-2">
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all cursor-pointer"
                >
                  <option value={UserRole.BUYER}>Ik wil kopen</option>
                  <option value={UserRole.SELLER}>Ik wil verkopen</option>
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
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-slate-950 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-xl hover:bg-[#FF4F00] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verwerken...' : activeTab === 'login' ? 'Inloggen' : 'Registreren'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;