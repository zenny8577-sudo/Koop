import React, { useState } from 'react';
import { UserRole, User } from '../../types';
import { useAuth } from '../../hooks/useAuth';

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
  const { signIn, signUp, loading, error: authError } = useAuth();

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (!validateEmail(email)) {
      alert('Voer een geldig e-mailadres in.');
      return;
    }

    if (password.length < 6) {
      alert('Wachtwoord moet minimaal 6 tekens bevatten.');
      return;
    }

    if (activeTab === 'register' && password !== confirmPassword) {
      alert('Wachtwoorden komen niet overeen.');
      return;
    }

    try {
      if (activeTab === 'login') {
        await signIn(email, password);
        // The useAuth hook will handle setting the user
        // The useEffect in App.tsx will handle the redirect
        // We just need to close the modal
        onClose();
      } else {
        const result = await signUp(email, password, role, firstName, lastName);
        
        // Check if user was created successfully
        if (result?.id) {
          // Check if this is an admin user (auto-verified)
          if (role === UserRole.ADMIN || email === 'brenodiogo27@icloud.com') {
            setShowSuccess(true);
            setTimeout(() => {
              onClose();
              setShowSuccess(false);
              setActiveTab('login');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setFirstName('');
              setLastName('');
            }, 2000);
          } else {
            // Regular users need email confirmation
            setShowEmailConfirmation(true);
          }
        }
        return;
      }
      
      // Reset form
      setActiveTab('login');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setShowEmailConfirmation(false);
    setShowSuccess(false);
  };

  if (showEmailConfirmation) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-fadeIn">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose} />
        <div className="relative bg-white w-full max-w-lg p-14 rounded-[50px] shadow-2xl text-center space-y-6 border border-slate-100">
          <div className="w-20 h-20 bg-orange-50 text-[#FF4F00] rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Bevestig Je Email</h3>
          <p className="text-slate-500 font-medium">We hebben een bevestigingsmail gestuurd naar {email}. Controleer je inbox en spam folder.</p>
          <button 
            onClick={() => {
              setShowEmailConfirmation(false);
              setActiveTab('login');
            }}
            className="w-full py-4 bg-slate-950 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-[#FF4F00] transition-all"
          >
            Naar Inloggen
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-fadeIn">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose} />
        <div className="relative bg-white w-full max-w-lg p-14 rounded-[50px] shadow-2xl text-center space-y-6 border border-slate-100">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Account Gemaakt!</h3>
          <p className="text-slate-500 font-medium">Je kunt nu inloggen.</p>
        </div>
      </div>
    );
  }

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

        {authError && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-slideIn">
            <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-[11px] font-black uppercase tracking-widest text-rose-500">{authError}</p>
          </div>
        )}

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
            disabled={loading}
            className="w-full py-6 bg-slate-950 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-xl hover:bg-[#FF4F00] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verwerken...' : activeTab === 'login' ? 'Doorgaan' : 'Account Aanmaken'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;