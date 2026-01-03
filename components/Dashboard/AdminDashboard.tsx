import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Product, User, UserRole } from '../../types';
import { ICONS } from '../../constants';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'users' | 'transactions'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    activeListings: 0,
    pendingApprovals: 0,
    newUsers: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allProducts = db.getAllProductsAdmin();
    const allUsers = db.getAllUsers();
    
    setProducts(allProducts);
    setUsers(allUsers);
    
    setStats({
      totalSales: allProducts.filter(p => p.status === ProductStatus.SOLD).length,
      activeListings: allProducts.filter(p => p.status === ProductStatus.ACTIVE).length,
      pendingApprovals: allProducts.filter(p => p.status === ProductStatus.PENDING_APPROVAL).length,
      newUsers: allUsers.filter(u => new Date(u.createdAt).getTime() > Date.now() - 86400000 * 7).length
    });
  };

  const approveProduct = (productId: string) => {
    db.updateProductStatus(productId, ProductStatus.ACTIVE);
    loadData();
  };

  const rejectProduct = (productId: string) => {
    db.updateProductStatus(productId, ProductStatus.REJECTED);
    loadData();
  };

  const verifyUser = (userId: string) => {
    db.updateUserVerification(userId, 'verified');
    loadData();
  };

  return (
    <div className="space-y-16 animate-fadeIn pb-40">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Admin Dashboard</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-950 tracking-tighter uppercase leading-[0.85]">
            Platform <br /> <span className="text-purple-600">Overzicht.</span>
          </h1>
          <nav className="flex gap-10 pt-4">
            {[
              { id: 'overview', label: 'Overzicht' },
              { id: 'products', label: 'Producten' },
              { id: 'users', label: 'Gebruikers' },
              { id: 'transactions', label: 'Transacties' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all relative pb-2 group ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
                <div className={`absolute bottom-0 left-0 h-1 bg-purple-600 transition-all duration-500 ${activeTab === tab.id ? 'w-full' : 'w-0 group-hover:w-4'}`} />
              </button>
            ))}
          </nav>
        </div>
      </header>

      {activeTab === 'overview' && (
        <div className="space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Totaal Verkoop', val: stats.totalSales, color: 'text-slate-950' },
              { label: 'Actieve Listings', val: stats.activeListings, color: 'text-emerald-500' },
              { label: 'Te Beoordelen', val: stats.pendingApprovals, color: 'text-[#FF4F00]' },
              { label: 'Nieuwe Gebruikers', val: stats.newUsers, color: 'text-purple-600' },
            ].map(m => (
              <div key={m.label} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                <p className={`text-4xl font-black tracking-tighter ${m.color}`}>{m.val}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[60px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter text-slate-950">Recentste Activiteit</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Laatste 24 uur</span>
            </div>
            <div className="p-12">
              <div className="h-64 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-300 font-black uppercase tracking-widest">
                Activiteit Grafiek
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="bg-white rounded-[60px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-950">Productbeheer</h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{products.length} Producten</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-12 py-8">Product</th>
                  <th className="px-12 py-8">Verkoper</th>
                  <th className="px-12 py-8 text-center">Status</th>
                  <th className="px-12 py-8 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-12 py-8">
                      <div className="flex items-center gap-6">
                        <img src={p.image} className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border border-slate-100 shadow-sm" alt={p.title} />
                        <div className="space-y-1">
                          <span className="text-sm font-black text-slate-900 uppercase tracking-tight block">{p.title}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">€ {p.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-8">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.sellerId}</span>
                    </td>
                    <td className="px-12 py-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.status === ProductStatus.ACTIVE ? 'bg-emerald-50 text-emerald-500' : p.status === ProductStatus.SOLD ? 'bg-slate-950 text-white' : 'bg-orange-50 text-[#FF4F00]'}`}>{p.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-12 py-8 text-right space-x-4">
                      {p.status === ProductStatus.PENDING_APPROVAL && (
                        <>
                          <button onClick={() => approveProduct(p.id)} className="text-[10px] font-black text-emerald-500 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest">Goedkeuren</button>
                          <button onClick={() => rejectProduct(p.id)} className="text-[10px] font-black text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest">Afwijzen</button>
                        </>
                      )}
                      <button className="text-[10px] font-black text-slate-400 hover:bg-slate-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest">Bewerken</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-[60px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-950">Gebruikersbeheer</h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{users.length} Gebruikers</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-12 py-8">Gebruiker</th>
                  <th className="px-12 py-8">Rol</th>
                  <th className="px-12 py-8 text-center">Status</th>
                  <th className="px-12 py-8 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-12 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          {u.email[0].toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-black text-slate-900 uppercase tracking-tight block">{u.email}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-8">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{u.role}</span>
                    </td>
                    <td className="px-12 py-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.verificationStatus === 'verified' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-400'}`}>
                        {u.verificationStatus || 'unverified'}
                      </span>
                    </td>
                    <td className="px-12 py-8 text-right space-x-4">
                      {u.verificationStatus !== 'verified' && u.role === UserRole.SELLER && (
                        <button onClick={() => verifyUser(u.id)} className="text-[10px] font-black text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest">Verifiëren</button>
                      )}
                      <button className="text-[10px] font-black text-slate-400 hover:bg-slate-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest">Logins Bekijken</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;