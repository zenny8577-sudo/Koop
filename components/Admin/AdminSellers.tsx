import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { supabase } from '../../src/integrations/supabase/client';

interface AdminSellersProps {
  users: User[];
  onUpdate: () => void;
}

const AdminSellers: React.FC<AdminSellersProps> = ({ users, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSeller, setNewSeller] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    companyName: '' // Campo opcional extra
  });

  const verifyUser = async (userId: string) => {
    if(confirm('Gebruiker verifiëren als verkoper?')) {
      const { error } = await supabase.from('users').update({ verification_status: 'verified' }).eq('id', userId);
      if (error) {
        alert('Fout bij verifiëren: ' + error.message);
      } else {
        onUpdate();
      }
    }
  };

  const handleAddSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Usa a mesma edge function de criar usuário, mas força a role SELLER
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: newSeller.email,
          password: newSeller.password,
          firstName: newSeller.firstName,
          lastName: newSeller.lastName,
          role: UserRole.SELLER,
          // Metadata extra pode ser passada se a função suportar, 
          // ou atualizamos o perfil depois se necessário. 
          // Por enquanto focamos no básico suportado pela função.
        }
      });

      if (error) throw new Error(error.message || 'Erro ao criar verkoper');

      // Se tivermos telefone, atualizamos o perfil recém criado
      if (newSeller.phone && data?.id) {
        await supabase.from('users').update({ phone: newSeller.phone }).eq('id', data.id);
      }
      
      alert('Verkoper account succesvol aangemaakt!');
      setShowModal(false);
      setNewSeller({ firstName: '', lastName: '', email: '', password: '', phone: '', companyName: '' });
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Fout bij aanmaken: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const sellers = users.filter(u => u.role === UserRole.SELLER);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FF4F00] transition-all flex items-center gap-2 shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Nieuwe Verkoper
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden animate-fadeIn">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Verkopers Management</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sellers.length} Partners</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-8 py-4">Bedrijf/Naam</th>
                <th className="px-8 py-4">Contact</th>
                <th className="px-8 py-4">Verificatie</th>
                <th className="px-8 py-4 text-right">Goedkeuring</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sellers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#FF4F00] text-white rounded-full flex items-center justify-center text-xs font-black">{u.email[0].toUpperCase()}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {u.id.substring(0,6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-xs font-medium text-slate-500">
                    <div className="flex flex-col gap-1">
                      <span>{u.email}</span>
                      <span className="text-slate-400">{u.phone || '-'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : u.verificationStatus === 'pending' ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                      {u.verificationStatus || 'unverified'}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    {u.verificationStatus !== 'verified' && (
                      <button onClick={() => verifyUser(u.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                        Verifiëren
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {sellers.length === 0 && (
                <tr><td colSpan={4} className="p-12 text-center text-slate-300 font-black uppercase tracking-widest">Geen verkopers gevonden</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <form onSubmit={handleAddSeller} className="relative bg-white w-full max-w-lg p-10 rounded-[40px] shadow-2xl space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">Partner</span>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">Nieuwe Verkoper.</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3">Voornaam</label>
                  <input 
                    required
                    placeholder="Jan" 
                    value={newSeller.firstName}
                    onChange={e => setNewSeller({...newSeller, firstName: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FF4F00]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3">Achternaam</label>
                  <input 
                    required
                    placeholder="Jansen" 
                    value={newSeller.lastName}
                    onChange={e => setNewSeller({...newSeller, lastName: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FF4F00]/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3">E-mailadres</label>
                <input 
                  type="email"
                  required
                  placeholder="verkoper@bedrijf.nl" 
                  value={newSeller.email}
                  onChange={e => setNewSeller({...newSeller, email: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FF4F00]/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3">Telefoon</label>
                <input 
                  type="tel"
                  placeholder="+31 6 12345678" 
                  value={newSeller.phone}
                  onChange={e => setNewSeller({...newSeller, phone: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FF4F00]/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3">Wachtwoord</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••" 
                  value={newSeller.password}
                  onChange={e => setNewSeller({...newSeller, password: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FF4F00]/20"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 bg-slate-50 text-slate-400 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-colors"
              >
                Annuleren
              </button>
              <button 
                type="submit"
                disabled={loading} 
                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#FF4F00] transition-colors shadow-xl"
              >
                {loading ? 'Aanmaken...' : 'Verkoper Toevoegen'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;