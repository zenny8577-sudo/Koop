import React from 'react';
import { Product, User, ProductStatus, Transaction } from '../../types';

interface AdminOverviewProps {
  products: Product[];
  users: User[];
  transactions: Transaction[];
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ products, users, transactions }) => {
  // Cálculos de estatísticas
  const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);
  const activeListings = products.filter(p => p.status === ProductStatus.ACTIVE).length;
  const pendingApprovals = products.filter(p => p.status === ProductStatus.PENDING_APPROVAL).length;
  
  // Simulação de dados para o gráfico (últimos 7 dias)
  const chartData = [65, 40, 75, 50, 85, 60, 95]; 

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 text-white p-10 rounded-[40px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          </div>
          <p className="text-4xl font-black relative z-10">€ {totalRevenue.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-2 relative z-10">
             <span className="text-[10px] uppercase tracking-widest opacity-60">Totale Omzet</span>
             <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                ↑ 12%
             </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-10 rounded-[40px] hover:shadow-xl transition-all duration-500">
          <p className="text-4xl font-black text-emerald-500">{activeListings}</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">Actieve Advertenties</p>
        </div>

        <div className="bg-white border border-slate-100 p-10 rounded-[40px] hover:shadow-xl transition-all duration-500">
          <p className="text-4xl font-black text-orange-500">{pendingApprovals}</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">In Behandeling</p>
        </div>

        <div className="bg-white border border-slate-100 p-10 rounded-[40px] hover:shadow-xl transition-all duration-500">
          <p className="text-4xl font-black text-purple-600">{users.length}</p>
          <div className="flex items-center gap-2 mt-2">
             <p className="text-[10px] uppercase tracking-widest text-slate-400">Gebruikers</p>
             <span className="bg-purple-50 text-purple-600 text-[9px] font-bold px-2 py-0.5 rounded">New</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Animated Chart */}
         <div className="lg:col-span-2 bg-slate-50 p-10 rounded-[40px] border border-slate-100">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Groei Analyse</h3>
               <select className="bg-white border-none rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer">
                  <option>Laatste 7 dagen</option>
                  <option>Deze maand</option>
                  <option>Dit jaar</option>
               </select>
            </div>
            
            <div className="h-64 flex items-end gap-3 sm:gap-6">
               {chartData.map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
                     <div className="relative w-full bg-white rounded-t-2xl overflow-hidden transition-all duration-300 group-hover:bg-purple-100" style={{ height: '100%' }}>
                        <div 
                           className="absolute bottom-0 left-0 w-full bg-slate-900 rounded-t-2xl transition-all duration-1000 ease-out group-hover:bg-purple-600"
                           style={{ height: `${value}%`, opacity: 0.1 }}
                        />
                        <div 
                           className="absolute bottom-0 left-0 w-full bg-slate-900 rounded-t-2xl transition-all duration-1000 ease-out delay-100 group-hover:bg-purple-600"
                           style={{ height: `${value * 0.6}%` }}
                        />
                     </div>
                     <p className="text-center text-[9px] font-bold text-slate-400 mt-3">{['MA', 'DI', 'WO', 'DO', 'VR', 'ZA', 'ZO'][i]}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Quick Actions / Notifications */}
         <div className="bg-purple-600 text-white p-10 rounded-[40px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
               <h3 className="text-2xl font-black uppercase tracking-tighter">Systeem Status</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs font-bold">API Connectie</span>
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Online</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs font-bold">Database</span>
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Gezond</span>
                  </div>
               </div>
            </div>
            
            <button className="w-full py-4 bg-white text-purple-600 font-black rounded-2xl uppercase tracking-widest text-[10px] mt-8 hover:bg-purple-50 transition-all">
               Systeem Rapport
            </button>
         </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
         <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Recente Bestellingen</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Bekijk Alles</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                     <th className="px-8 py-4">Order ID</th>
                     <th className="px-8 py-4">Klant</th>
                     <th className="px-8 py-4 text-right">Bedrag</th>
                     <th className="px-8 py-4 text-center">Status</th>
                     <th className="px-8 py-4 text-right">Datum</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {transactions.slice(0, 5).map((t) => (
                     <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="px-8 py-4 font-mono text-xs text-slate-500">#{t.id.substring(0,8)}</td>
                        <td className="px-8 py-4 font-bold text-sm text-slate-900">Klant ID: {t.userId.substring(0,6)}...</td>
                        <td className="px-8 py-4 text-right font-black">€ {t.amount.toLocaleString()}</td>
                        <td className="px-8 py-4 text-center">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}>
                              {t.status || 'Completed'}
                           </span>
                        </td>
                        <td className="px-8 py-4 text-right text-[10px] font-bold text-slate-400">
                           {new Date(t.createdAt).toLocaleDateString('nl-NL')}
                        </td>
                     </tr>
                  ))}
                  {transactions.length === 0 && (
                     <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-300 font-black uppercase tracking-widest">Nog geen bestellingen</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AdminOverview;