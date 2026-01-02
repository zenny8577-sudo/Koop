
import React, { useState } from 'react';
import { User } from '../../types';
import { db } from '../../services/db';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (user: User) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const updatedUser = db.updateUser(user.id, formData);
      if (updatedUser) onUpdate(updatedUser);
      setIsSaving(false);
      alert('Profiel succesvol bijgewerkt!');
    }, 800);
  };

  const handleStartVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const updatedUser = db.submitVerification(user.id, ['id_card_sim.pdf', 'kvk_extract_sim.pdf']);
      if (updatedUser) onUpdate(updatedUser);
      setIsVerifying(false);
      alert('Verificatie aanvraag verzonden! Onze curatoren nemen dit binnen 24 uur in behandeling.');
    }, 1500);
  };

  const statusMap = {
    unverified: { label: 'Niet Geverifieerd', color: 'bg-slate-100 text-slate-400', icon: null },
    pending: { label: 'Review in Behandeling', color: 'bg-orange-50 text-orange-500 border border-orange-100', icon: '⏳' },
    verified: { label: 'Geverifieerd Account', color: 'bg-blue-50 text-blue-600 border border-blue-100', icon: '🛡️' },
    rejected: { label: 'Verificatie Afgewezen', color: 'bg-rose-50 text-rose-500 border border-rose-100', icon: '❌' }
  };

  const currentStatus = statusMap[user.verificationStatus || 'unverified'];

  return (
    <div className="space-y-12 animate-fadeIn">
      <div className="bg-white rounded-[48px] border border-slate-100 p-12 lg:p-20 shadow-sm">
        <div className="space-y-12 max-w-3xl">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Persoonlijke Info.</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Beheer uw accountgegevens e contactinformatie</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Voornaam</label>
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                  placeholder="Voornaam"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Achternaam</label>
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                  placeholder="Achternaam"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">E-mailadres</label>
              <input 
                type="email" 
                value={formData.email}
                readOnly
                className="w-full bg-slate-50/50 border-none rounded-3xl px-8 py-5 text-sm font-bold text-slate-400 cursor-not-allowed outline-none"
                placeholder="e-mail@koop.nl"
              />
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 px-4">E-mail kan niet worden gewijzigd om veiligheidsredenen.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Telefoonnummer</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                placeholder="+31 6 12345678"
              />
            </div>

            <button 
              type="submit"
              disabled={isSaving}
              className="px-12 py-6 bg-slate-950 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#FF4F00] transition-all transform hover:-translate-y-1 shadow-2xl disabled:opacity-50"
            >
              {isSaving ? 'Opslaan...' : 'Profiel Bijwerken'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-slate-50 rounded-[48px] border border-slate-200 p-12 lg:p-20 shadow-inner">
        <div className="space-y-12 max-w-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Account Verificatie.</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Verhoog het vertrouwen e uw verkooplimieten</p>
            </div>
            <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${currentStatus.color}`}>
               {currentStatus.icon && <span>{currentStatus.icon}</span>}
               {currentStatus.label}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-[40px] border border-slate-100 space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Waarom verifiëren?</h4>
               <ul className="space-y-3">
                  {[
                    'Hogere verkooplimieten',
                    'Directe uitbetalingen',
                    'Exclusieve "Verified" badge',
                    'Hogere ranking in de shop'
                  ].map(t => (
                    <li key={t} className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                       <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                       {t}
                    </li>
                  ))}
               </ul>
            </div>

            <div className="flex flex-col justify-center gap-6">
              {(!user.verificationStatus || user.verificationStatus === 'unverified' || user.verificationStatus === 'rejected') && (
                <div className="space-y-6">
                   <p className="text-xs font-medium text-slate-500 leading-relaxed">Om je account te verifiëren hebben we een kopie van je ID e een recent uittreksel van de Kamer van Koophandel (KVK) nodig.</p>
                   <button 
                     onClick={handleStartVerification}
                     disabled={isVerifying}
                     className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10"
                   >
                     {isVerifying ? 'Versturen...' : 'Start Verificatie Proces'}
                   </button>
                </div>
              )}

              {user.verificationStatus === 'pending' && (
                <div className="p-8 bg-orange-50 rounded-[32px] border border-orange-100 space-y-4">
                   <p className="text-xs font-bold text-orange-600 uppercase tracking-tight">Documenten Ontvangen</p>
                   <p className="text-[10px] text-orange-500/80 leading-relaxed font-medium">Onze curatoren controleren momenteel je gegevens. Je ontvangt binnen 24 uur bericht via e-mail.</p>
                </div>
              )}

              {user.verificationStatus === 'verified' && (
                <div className="p-8 bg-blue-50 rounded-[32px] border border-blue-100 space-y-4">
                   <p className="text-xs font-bold text-blue-600 uppercase tracking-tight">Status: Premium Verkoper</p>
                   <p className="text-[10px] text-blue-500/80 leading-relaxed font-medium">Je account is volledig geverifieerd. Je geniet nu van alle premium voordelen van het Koop platform.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
