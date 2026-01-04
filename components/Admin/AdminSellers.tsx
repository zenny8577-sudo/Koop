import React from 'react';
import { User, UserRole } from '../../types';
import { supabase } from '../../src/integrations/supabase/client';

interface AdminSellersProps {
  users: User[];
  onUpdate: () => void;
}

const AdminSellers: React.FC<AdminSellersProps> = ({ users, onUpdate }) => {
  const verifyUser = async (userId: string) => {
    if(confirm('Gebruiker verifiëren als verkoper?')) {
      await supabase.from('users').update({ verification_status: 'verified' }).eq('id', userId);
      onUpdate();
    }
  };

  const sellers = users.filter(u => u.role === UserRole.SELLER);

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden animate-fadeIn">
      <div className="p-8 border-b border-slate-50">
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Verkopers Management</h3>
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
                    <div className="w-8 h-8 bg-[#FF4F00] text-white rounded-full flex items-center justify-center text-xs font-black">{u.email[0].toUpperCase()}</div>
                    <p className="text-xs font-bold text-slate-900">{u.firstName || 'Naamloos'}</p>
                  </div>
                </td>
                <td className="px-8 py-4 text-xs text-slate-500">
                  {u.email}<br/>{u.phone}
                </td>
                <td className="px-8 py-4">
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${u.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-500' : u.verificationStatus === 'pending' ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-400'}`}>
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
              <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-xs font-bold uppercase">Geen verkopers gevonden</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSellers;