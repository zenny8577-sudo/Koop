import React from 'react';
import { User } from '../../types';

interface AdminUsersProps {
  users: User[];
}

const AdminUsers: React.FC<AdminUsersProps> = ({ users }) => {
  return (
    <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden animate-fadeIn">
      <div className="p-8 border-b border-slate-50">
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Alle Gebruikers</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-8 py-4">Gebruiker</th>
              <th className="px-8 py-4">Rol</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Sinds</th>
              <th className="px-8 py-4 text-right">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black">{u.email[0].toUpperCase()}</div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                      <p className="text-[9px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[10px] font-black uppercase tracking-widest">{u.role}</span>
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
                  <button className="text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900">Beheer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;