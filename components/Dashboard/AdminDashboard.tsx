import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../../services/supabaseService';
import { Product, User, UserRole, ProductStatus } from '../../types';
import { ICONS } from '../../constants';
import { AnalyticsService } from '../../services/analyticsService';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    AnalyticsService.trackEvent('admin_dashboard_view');
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load products
      const productsResponse = await SupabaseService.getProducts(1, 1000, {});
      setProducts(productsResponse.data);

      // Load users
      const { data: usersData, error: usersError } = await SupabaseService.supabase
        .from('users')
        .select('*');

      if (usersError) throw usersError;
      setUsers(usersData);

      // Calculate stats
      setStats({
        totalSales: productsResponse.data.filter(p => p.status === ProductStatus.SOLD).length,
        activeListings: productsResponse.data.filter(p => p.status === ProductStatus.ACTIVE).length,
        pendingApprovals: productsResponse.data.filter(p => p.status === ProductStatus.PENDING_APPROVAL).length,
        newUsers: usersData.filter(u => new Date(u.created_at).getTime() > Date.now() - 86400000 * 7).length
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Admin dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveProduct = async (productId: string) => {
    try {
      await SupabaseService.updateProductStatus(productId, ProductStatus.ACTIVE);
      await loadData();
      AnalyticsService.trackEvent('product_approved', { productId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve product');
    }
  };

  const rejectProduct = async (productId: string) => {
    try {
      await SupabaseService.updateProductStatus(productId, ProductStatus.REJECTED);
      await loadData();
      AnalyticsService.trackEvent('product_rejected', { productId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject product');
    }
  };

  const verifyUser = async (userId: string) => {
    try {
      await SupabaseService.updateUser(userId, { verification_status: 'verified' });
      await loadData();
      AnalyticsService.trackEvent('user_verified', { userId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4F00]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-rose-800 mb-2">Error</h3>
          <p className="text-rose-600">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                          {u.email?.[0]?.toUpperCase()}
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