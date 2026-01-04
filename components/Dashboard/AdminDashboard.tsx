import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/integrations/supabase/client';
import { Product, User, UserRole, ProductStatus, ProductCondition } from '../../types';
import { AnalyticsService } from '../../services/analyticsService';
import ProductForm from '../Admin/ProductForm';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'users' | 'import'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, activeListings: 0, pendingApprovals: 0, newUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States para Importação/Criação
  const [showProductForm, setShowProductForm] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');

  useEffect(() => {
    loadData();
    AnalyticsService.trackEvent('admin_dashboard_view');
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: productsData, error: prodError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (prodError) throw prodError;
      
      const { data: usersData, error: usersError } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (usersError) throw usersError;
      
      setProducts(productsData || []);
      setUsers(usersData || []);
      
      setStats({
        totalSales: (productsData || []).filter((p: any) => p.status === ProductStatus.SOLD).length,
        activeListings: (productsData || []).filter((p: any) => p.status === ProductStatus.ACTIVE).length,
        pendingApprovals: (productsData || []).filter((p: any) => p.status === ProductStatus.PENDING_APPROVAL).length,
        newUsers: (usersData || []).filter((u: any) => new Date(u.created_at).getTime() > Date.now() - 86400000 * 7).length
      });
    } catch (err) {
      console.error('Admin load error:', err);
      setError('Failed to load data. Ensure you are logged in as Admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (formData: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const productPayload = {
        ...formData,
        seller_id: user.id,
        commission_rate: 0.15,
        commission_amount: formData.price * 0.15,
        shipping_methods: ['postnl', 'dhl']
      };

      const { error } = await supabase.from('products').insert([productPayload]);
      if (error) throw error;

      await loadData();
      setShowProductForm(false);
      alert('Product created successfully!');
    } catch (err) {
      alert('Error creating product: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (productId: string, status: ProductStatus) => {
    try {
      const { error } = await supabase.from('products').update({ status }).eq('id', productId);
      if (error) throw error;
      
      // Update local state for immediate feedback
      setProducts(products.map(p => p.id === productId ? { ...p, status } : p));
      AnalyticsService.trackEvent(`product_${status.toLowerCase()}`, { productId });
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleUserVerification = async (userId: string, status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase.from('users').update({ verification_status: status }).eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, verificationStatus: status } : u));
    } catch (err) {
      alert('Failed to update user');
    }
  };

  // Simulação de Importação Dropshipping Inteligente
  const handleSmartImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;
    
    setIsImporting(true);
    
    // Simulação de delay de raspagem (scraping)
    setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Gerar dados baseados na URL (Mock inteligente)
        const isTemu = importUrl.includes('temu');
        const isAli = importUrl.includes('aliexpress');
        
        const mockProduct = {
          title: isTemu ? "Temu Import: Smart Gadget Pro X" : isAli ? "AliExpress: Premium Tech Accessory" : "Imported Product",
          description: `Automatically imported from ${importUrl}. Features premium build quality and verified specs.`,
          price: Math.floor(Math.random() * 50) + 20,
          category: 'Gadgets',
          condition: ProductCondition.NEW,
          image: isTemu 
            ? 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800' 
            : 'https://images.unsplash.com/photo-1517336714467-d13a863b17e9?auto=format&fit=crop&q=80&w=800',
          seller_id: user.id,
          status: ProductStatus.ACTIVE,
          sku: `DROP-${Date.now()}`,
          stock: 100,
          commission_rate: 0.20, // Higher commission for dropshipping
          commission_amount: 5
        };

        const { error } = await supabase.from('products').insert([mockProduct]);
        if (error) throw error;

        await loadData();
        setImportUrl('');
        alert('Product imported successfully from external source!');
      } catch (err) {
        alert('Import failed');
      } finally {
        setIsImporting(false);
      }
    }, 2000);
  };

  const handleBulkImport = async () => {
    if (!bulkImportText) return;
    setIsImporting(true);
    const urls = bulkImportText.split('\n').filter(u => u.trim().length > 0);
    
    // Process one by one (mock)
    let processed = 0;
    for (const url of urls) {
       // Mock insertion for each
       await new Promise(r => setTimeout(r, 500)); // fast mock
       processed++;
    }
    
    setIsImporting(false);
    setBulkImportText('');
    alert(`${processed} products queued for import.`);
    loadData();
  };

  if (loading && !products.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-fadeIn pb-40">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Admin Control Center</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-950 tracking-tighter uppercase leading-[0.85]">
            Platform <br />
            <span className="text-purple-600">Manager.</span>
          </h1>
          <nav className="flex gap-8 pt-4 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overzicht' },
              { id: 'products', label: 'Producten' },
              { id: 'import', label: 'Dropshipping & Import' },
              { id: 'users', label: 'Gebruikers' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => { setActiveTab(tab.id as any); setShowProductForm(false); }} 
                className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all relative pb-2 whitespace-nowrap group ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
                <div className={`absolute bottom-0 left-0 h-1 bg-purple-600 transition-all duration-500 ${activeTab === tab.id ? 'w-full' : 'w-0 group-hover:w-4'}`} />
              </button>
            ))}
          </nav>
        </div>
        {activeTab === 'products' && !showProductForm && (
          <button 
            onClick={() => setShowProductForm(true)} 
            className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/20"
          >
            + Nieuw Product
          </button>
        )}
      </header>

      {/* OVERVIEW TAB */}
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
        </div>
      )}

      {/* IMPORT / DROPSHIPPING TAB */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* Single URL Import */}
           <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm space-y-8">
              <div className="space-y-4">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-600">Smart Import</span>
                 <h2 className="text-3xl font-black uppercase tracking-tighter">Importeer via URL</h2>
                 <p className="text-slate-500 text-sm font-medium">Ondersteunt AliExpress, Temu, Bol.com e Amazon links.</p>
              </div>
              <form onSubmit={handleSmartImport} className="space-y-6">
                 <input 
                   type="url" 
                   placeholder="https://..." 
                   required
                   value={importUrl}
                   onChange={e => setImportUrl(e.target.value)}
                   className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-purple-500/10 outline-none"
                 />
                 <button 
                   type="submit"
                   disabled={isImporting}
                   className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50"
                 >
                   {isImporting ? 'Scraping Data...' : 'Start Import'}
                 </button>
              </form>
              <div className="flex gap-4 opacity-50 grayscale">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Aliexpress_logo.svg" className="h-6" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Temu_logo.svg" className="h-6" />
              </div>
           </div>

           {/* Bulk Import */}
           <div className="bg-slate-950 p-12 rounded-[50px] shadow-2xl text-white space-y-8">
              <div className="space-y-4">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Bulk Tools</span>
                 <h2 className="text-3xl font-black uppercase tracking-tighter">Massa Import</h2>
                 <p className="text-white/60 text-sm font-medium">Plak meerdere URLs (één per regel) voor batch verwerking.</p>
              </div>
              <textarea 
                value={bulkImportText}
                onChange={e => setBulkImportText(e.target.value)}
                placeholder="https://item1...&#10;https://item2...&#10;https://item3..." 
                className="w-full bg-white/10 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-emerald-500/20 outline-none h-40 text-white placeholder:text-white/20"
              />
              <button 
                onClick={handleBulkImport}
                disabled={isImporting}
                className="w-full py-5 bg-emerald-500 text-slate-900 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
              >
                {isImporting ? 'Processing Queue...' : 'Batch Uitvoeren'}
              </button>
           </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        showProductForm ? (
          <ProductForm 
            isLoading={loading} 
            onSubmit={handleCreateProduct} 
            onCancel={() => setShowProductForm(false)} 
          />
        ) : (
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
                    <th className="px-12 py-8 text-center">Status</th>
                    <th className="px-12 py-8 text-right">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-12 py-8">
                        <div className="flex items-center gap-6">
                          <img src={p.image} className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border border-slate-100 shadow-sm" />
                          <div className="space-y-1">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight block">{p.title}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">€ {p.price}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-8 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.status === ProductStatus.ACTIVE ? 'bg-emerald-50 text-emerald-500' : p.status === ProductStatus.PENDING_APPROVAL ? 'bg-orange-50 text-[#FF4F00]' : 'bg-slate-100 text-slate-400'}`}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-12 py-8 text-right space-x-2">
                        {p.status === ProductStatus.PENDING_APPROVAL && (
                          <button onClick={() => handleStatusChange(p.id, ProductStatus.ACTIVE)} className="text-[10px] font-black text-emerald-500 hover:bg-emerald-50 px-3 py-2 rounded-xl">✓ Keur Goed</button>
                        )}
                        {p.status === ProductStatus.ACTIVE && (
                          <button onClick={() => handleStatusChange(p.id, ProductStatus.SOLD)} className="text-[10px] font-black text-slate-400 hover:bg-slate-50 px-3 py-2 rounded-xl">Markeer Verkocht</button>
                        )}
                        <button 
                          onClick={() => { if(confirm('Delete?')) handleStatusChange(p.id, ProductStatus.REJECTED); }}
                          className="text-[10px] font-black text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-xl"
                        >
                          Verwijder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-[60px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-950">Gebruikersbeheer</h2>
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
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                          {u.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-black text-slate-900 uppercase tracking-tight block">{u.email}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {u.id.substring(0,8)}...</span>
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
                    <td className="px-12 py-8 text-right">
                       {u.verificationStatus !== 'verified' && (
                         <button onClick={() => handleUserVerification(u.id, 'verified')} className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all">
                           Verifieer
                         </button>
                       )}
                       {u.role !== 'ADMIN' && (
                         <button className="text-[10px] font-black text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all">
                           Blokkeer
                         </button>
                       )}
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