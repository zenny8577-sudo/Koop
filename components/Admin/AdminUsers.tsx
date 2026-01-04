import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { supabase } from '../../src/integrations/supabase/client';

interface AdminUsersProps {
  users: User[];
}

const AdminUsers: React.FC<AdminUsersProps> = ({ users }) => {
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.BUYER
  });
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: newUser
      });

      if (error) throw new Error(error.message || 'Erro ao criar usuário');
      
      alert('Gebruiker succesvol aangemaakt!');
      setShowModal(false);
      setNewUser({ email: '', password: '', firstName: '', lastName: '', role: UserRole.BUYER });
      // In a real app, you'd trigger a reload here
    } catch (err) {
      console.error(err);
      alert('Fout bij aanmaken: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FF4F00] transition-all"
        >
          + Nieuwe Gebruiker
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/10 overflow-hidden animate-fadeIn">
        <div className="p-8 border-b border-slate-50 dark:border-white/5">
          <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Alle Gebruikers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-8 py-4">Gebruiker</th>
                <th className="px-8 py-4">Rol</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Sinds</th>
                <th className="px-8 py-4 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-xs font-black">{u.email[0].toUpperCase()}</div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{u.firstName} {u.lastName}</p>
                        <p className="text-[9px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{u.role}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${u.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                      {u.verificationStatus}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-[10px] font-bold text-slate-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white">Beheer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form onSubmit={handleCreateUser} className="relative bg-white w-full max-w-lg p-10 rounded-[40px] space-y-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Nieuwe Gebruiker</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <input 
                placeholder="Voornaam" 
                value={newUser.firstName}
                onChange={e => setNewUser({...newUser, firstName: e.target.value})}
                className="bg-slate-50 border-none rounded-xl p-4 font-bold text-sm"
              />
              <input 
                placeholder="Achternaam" 
                value={newUser.lastName}
                onChange={e => setNewUser({...newUser, lastName: e.target.value})}
                className="bg-slate-50 border-none rounded-xl p-4 font-bold text-sm"
              />
            </div>
            <input 
              type="email"
              required
              placeholder="E-mailadres" 
              value={newUser.email}
              onChange={e => setNewUser({...newUser, email: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-sm"
            />
            <input 
              type="password"
              required
              placeholder="Wachtwoord" 
              value={newUser.password}
              onChange={e => setNewUser({...newUser, password: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-sm"
            />
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400">Rol</label>
              <select 
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-sm"
              >
                <option value={UserRole.BUYER}>Koper (Buyer)</option>
                <option value={UserRole.SELLER}>Verkoper (Seller)</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </div>

            <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#FF4F00] transition-colors">
              {loading ? 'Aanmaken...' : 'Gebruiker Toevoegen'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;