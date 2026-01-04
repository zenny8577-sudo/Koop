import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/integrations/supabase/client';
import { Product, User, ProductStatus, ProductCondition, UserRole } from '../../types';
import ProductForm from '../Admin/ProductForm';
import { mockProducts } from '../../services/mockData';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'import' | 'users' | 'sellers' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<string[]>(['Elektronica', 'Design', 'Fietsen', 'Antiek', 'Gadgets', 'Mode']);
  const [tags, setTags] = useState<string[]>(['Nieuw', 'Vintage', 'Refurbished', 'Sale']);
  const [stats, setStats] = useState({ totalSales: 0, activeListings: 0, pendingApprovals: 0, newUsers: 0 });
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [apiKeys, setApiKeys] = useState({
    openRouter: localStorage.getItem('koop_openrouter_key') || '',
    stripe: localStorage.getItem('koop_stripe_key') || ''
  });
  
  // UI States
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategory, setNewCategory] = useState('');
  
  // Import States
  const [importUrl, setImportUrl] = useState('');
  const [priceMarkup, setPriceMarkup] = useState(20);
  const [isImporting, setIsImporting] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      
      let allProducts = productsData || [];
      if (allProducts.length === 0) {
          allProducts = [...mockProducts];
      }
      
      setProducts(allProducts);
      setUsers(usersData || []);
      
      setStats({
        totalSales: allProducts.filter((p: any) => p.status === ProductStatus.SOLD).length,
        activeListings: allProducts.filter((p: any) => p.status === ProductStatus.ACTIVE).length,
        pendingApprovals: allProducts.filter((p: any) => p.status === ProductStatus.PENDING_APPROVAL).length,
        newUsers: (usersData || []).length
      });
    } catch (err) {
      console.error('Admin load error:', err);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('koop_openrouter_key', apiKeys.openRouter);
    localStorage.setItem('koop_stripe_key', apiKeys.stripe);
    alert('Instellingen opgeslagen!');
  };

  // --- PRODUTOS ---

  const handleCreateOrUpdateProduct = async (formData: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'admin_local';

      const productPayload = {
        ...formData,
        seller_id: userId,
        commission_rate: 0.15,
        commission_amount: formData.price * 0.15,
        shipping_methods: ['postnl', 'dhl'],
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
         const { error } = await supabase.from('products').update(productPayload).eq('id', editingProduct.id);
         if (error) throw error;
         alert('Product bijgewerkt!');
      } else {
         const { error } = await supabase.from('products').insert([{
             ...productPayload,
             created_at: new Date().toISOString(),
             status: ProductStatus.ACTIVE
         }]);
         if (error) throw error;
         alert('Product aangemaakt!');
      }

      await loadData();
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (err) {
      alert('Actie mislukt: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Weet u zeker dat u dit product wilt verwijderen?')) return;
    try {
      await supabase.from('products').delete().eq('id', productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleApproveProduct = async (productId: string) => {
      try {
          await supabase.from('products').update({ status: ProductStatus.ACTIVE }).eq('id', productId);
          setProducts(products.map(p => p.id === productId ? { ...p, status: ProductStatus.ACTIVE } : p));
      } catch (e) {
          alert('Fout bij goedkeuren');
      }
  };

  const handleRejectProduct = async (productId: string) => {
    if (!confirm('Product afwijzen?')) return;
    try {
        await supabase.from('products').update({ status: ProductStatus.REJECTED }).eq('id', productId);
        setProducts(products.map(p => p.id === productId ? { ...p, status: ProductStatus.REJECTED } : p));
    } catch (e) {
        alert('Fout bij afwijzen');
    }
};

  // --- CATEGORIAS ---

  const handleAddCategory = () => {
      if (newCategory && !categories.includes(newCategory)) {
          setCategories([...categories, newCategory]);
          setNewCategory('');
      }
  };

  const handleRemoveCategory = (cat: string) => {
      setCategories(categories.filter(c => c !== cat));
  };

  // --- IMPORT ---

  const handleSmartImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;
    
    if (!apiKeys.openRouter) {
        alert('Configureer eerst de OpenRouter API Key in het tabblad "Instellingen".');
        setActiveTab('settings');
        return;
    }

    setIsImporting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'admin_local';

      // Send the API key explicitly to the Edge Function
      const { data: aiProduct, error: fnError } = await supabase.functions.invoke('clone-product', {
        body: { 
            url: importUrl,
            apiKey: apiKeys.openRouter 
        }
      });

      if (fnError) throw new Error(fnError.message || 'AI Verbinding Mislukt');
      if (!aiProduct) throw new Error('Geen data ontvangen van AI.');

      const basePrice = aiProduct.price || 50;
      const finalPrice = basePrice * (1 + (priceMarkup / 100));

      const newProduct = {
        title: aiProduct.title || "Geïmporteerd Item",
        description: aiProduct.description || `Geïmporteerd van: ${importUrl}`,
        price: parseFloat(finalPrice.toFixed(2)),
        category: aiProduct.category || 'Gadgets',
        condition: ProductCondition.NEW,
        image: aiProduct.image || 'https://via.placeholder.com/800',
        seller_id: userId,
        status: ProductStatus.ACTIVE,
        sku: `DROP-${Date.now()}`,
        created_at: new Date().toISOString(),
        commission_rate: 0.15,
        commission_amount: parseFloat(finalPrice.toFixed(2)) * 0.15,
        shipping_methods: ['postnl']
      };

      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) throw error;

      await loadData();
      setImportUrl('');
      alert(`Product "${newProduct.title}" succesvol geïmporteerd!`);
    } catch (err) {
      console.error(err);
      alert('Import Mislukt: ' + (err as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleCSVImport = async () => {
    // ... CSV logic remains same
    alert('CSV Import (Mock Logic) triggered');
  };

  const verifyUser = async (userId: string) => {
      if(confirm('Gebruiker verifiëren als verkoper?')) {
          await supabase.from('users').update({ verification_status: 'verified' }).eq('id', userId);
          setUsers(users.map(u => u.id === userId ? { ...u, verificationStatus: 'verified' } : u));
      }
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-40">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Beheerderscontrole</span>
          </div>
          <h1 className="text-6xl font-black text-slate-950 tracking-tighter uppercase leading-[0.85]">
            Beheerders <br /><span className="text-purple-600">Paneel.</span>
          </h1>
          <nav className="flex gap-4 pt-4 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overzicht' },
              { id: 'products', label: 'Producten' },
              { id: 'categories', label: 'Categorieën' },
              { id: 'import', label: 'Importeren' },
              { id: 'users', label: 'Gebruikers' },
              { id: 'sellers', label: 'Verkopers' },
              { id: 'settings', label: 'Instellingen' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => { setActiveTab(tab.id as any); setShowProductForm(false); }} 
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-slate-900 text-white p-10 rounded-[40px]">
              <p className="text-4xl font-black">{stats.totalSales}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-60 mt-2">Totale Verkopen</p>
           </div>
           <div className="bg-white border border-slate-100 p-10 rounded-[40px]">
              <p className="text-4xl font-black text-emerald-500">{stats.activeListings}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">Actieve Advertenties</p>
           </div>
           <div className="bg-white border border-slate-100 p-10 rounded-[40px]">
              <p className="text-4xl font-black text-orange-500">{stats.pendingApprovals}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">In Behandeling</p>
           </div>
           <div className="bg-white border border-slate-100 p-10 rounded-[40px]">
              <p className="text-4xl font-black text-purple-600">{stats.newUsers}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">Gebruikers</p>
           </div>
        </div>
      )}

      {/* SETTINGS (Instellingen) */}
      {activeTab === 'settings' && (
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 max-w-2xl">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8">Systeem Instellingen</h3>
              
              <div className="space-y-8">
                  <div className="space-y-3">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-500">OpenRouter API Key (AI Import)</label>
                          {apiKeys.openRouter ? (
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Verbonden</span>
                          ) : (
                              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded">Niet Verbonden</span>
                          )}
                      </div>
                      <input 
                          type="password"
                          value={apiKeys.openRouter}
                          onChange={e => setApiKeys({...apiKeys, openRouter: e.target.value})}
                          placeholder="sk-or-v1-..."
                          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-mono outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                      <p className="text-[10px] text-slate-400">Nodig voor de 'Smart Clone' functie in het import tabblad.</p>
                  </div>

                  <div className="space-y-3">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-500">Stripe Secret Key (Betalingen)</label>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Binnenkort</span>
                      </div>
                      <input 
                          disabled
                          placeholder="sk_test_..."
                          className="w-full bg-slate-50/50 border-none rounded-2xl px-6 py-4 text-sm font-mono outline-none cursor-not-allowed opacity-50"
                      />
                  </div>

                  <div className="pt-4">
                      <button 
                          onClick={handleSaveSettings}
                          className="px-8 py-4 bg-purple-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-purple-700 transition-all shadow-xl"
                      >
                          Instellingen Opslaan
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* CATEGORIES */}
      {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[40px] border border-slate-100">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-6">Categorieën Beheer</h3>
                  <div className="flex gap-4 mb-6">
                      <input 
                        value={newCategory} 
                        onChange={e => setNewCategory(e.target.value)}
                        placeholder="Nieuwe Categorie" 
                        className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none"
                      />
                      <button onClick={handleAddCategory} className="bg-purple-600 text-white px-6 rounded-xl font-black text-xs uppercase hover:bg-purple-700">+</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                      {categories.map(cat => (
                          <div key={cat} className="px-4 py-2 bg-slate-50 rounded-xl flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-900">{cat}</span>
                              <button onClick={() => handleRemoveCategory(cat)} className="text-rose-400 hover:text-rose-600 font-bold">×</button>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] border border-slate-100">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-6">Tags Beheer</h3>
                  <div className="flex flex-wrap gap-3">
                      {tags.map(tag => (
                          <div key={tag} className="px-4 py-2 bg-purple-50 rounded-xl text-purple-600 text-xs font-black uppercase tracking-widest">
                              #{tag}
                          </div>
                      ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest">Tags worden automatisch gegenereerd op basis van productfilters.</p>
              </div>
          </div>
      )}

      {/* IMPORT */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <span className="w-8 h-8 flex items-center justify-center bg-purple-50 text-purple-600 rounded-full">⚡</span>
                 <h3 className="text-xl font-black uppercase tracking-tighter">Smart Clone (IA)</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">Plak de link (AliExpress, Temu, Amazon) om te klonen.</p>
              
              <form onSubmit={handleSmartImport} className="space-y-4">
                 <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-3 mb-1 block">Productlink</label>
                    <input 
                      required 
                      value={importUrl}
                      onChange={e => setImportUrl(e.target.value)}
                      placeholder="https://..." 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 outline-none" 
                    />
                 </div>
                 
                 <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-3 mb-1 block">Winstmarge (%)</label>
                    <div className="flex items-center gap-4">
                       <input 
                         type="range" min="0" max="200" step="5"
                         value={priceMarkup}
                         onChange={e => setPriceMarkup(Number(e.target.value))}
                         className="flex-1 accent-purple-600"
                       />
                       <span className="font-black text-purple-600 w-12 text-right">{priceMarkup}%</span>
                    </div>
                 </div>

                 <button disabled={isImporting} className="w-full py-4 bg-purple-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-purple-700 transition-all disabled:opacity-50">
                    {isImporting ? 'IA Analyseren & Importeren...' : 'Start Smart Clone'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-8">
           {!showProductForm ? (
             <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                   <h2 className="font-black uppercase tracking-tighter text-slate-900">Wereldwijde Catalogus</h2>
                   <button 
                     onClick={() => { setEditingProduct(null); setShowProductForm(true); }} 
                     className="px-6 py-3 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
                   >
                     + Nieuw Product
                   </button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
                         <tr>
                            <th className="px-8 py-4">Item</th>
                            <th className="px-8 py-4 text-center">Prijs</th>
                            <th className="px-8 py-4 text-center">Status</th>
                            <th className="px-8 py-4 text-right">Acties</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {products.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50/50">
                               <td className="px-8 py-4">
                                  <div className="flex items-center gap-4">
                                     <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                                     <div>
                                         <span className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[200px]">{p.title}</span>
                                         <span className="text-[9px] text-slate-400">{p.id.substring(0,8)}</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-4 text-center font-bold">€{p.price}</td>
                               <td className="px-8 py-4 text-center">
                                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : p.status === 'PENDING_APPROVAL' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {p.status.replace('_', ' ')}
                                  </span>
                               </td>
                               <td className="px-8 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                      {p.status === ProductStatus.PENDING_APPROVAL && (
                                          <>
                                            <button onClick={() => handleApproveProduct(p.id)} className="text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded text-[10px] font-black uppercase">Goedkeuren</button>
                                            <button onClick={() => handleRejectProduct(p.id)} className="text-rose-500 hover:bg-rose-50 px-3 py-1 rounded text-[10px] font-black uppercase">Afwijzen</button>
                                          </>
                                      )}
                                      <button onClick={() => { setEditingProduct(p); setShowProductForm(true); }} className="text-blue-500 hover:text-blue-700 text-[10px] font-bold uppercase">Bewerken</button>
                                      <button onClick={() => handleDeleteProduct(p.id)} className="text-slate-400 hover:text-rose-500 text-[10px] font-bold uppercase">×</button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           ) : (
             <ProductForm 
               initialData={editingProduct || {}}
               isLoading={loading} 
               onSubmit={handleCreateOrUpdateProduct} 
               onCancel={() => setShowProductForm(false)} 
             />
           )}
        </div>
      )}

      {/* USERS LIST (General) */}
      {activeTab === 'users' && (
         <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden">
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
      )}

      {/* SELLERS MANAGEMENT */}
      {activeTab === 'sellers' && (
         <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden">
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
                     {users.filter(u => u.role === UserRole.SELLER).map(u => (
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
                     {users.filter(u => u.role === UserRole.SELLER).length === 0 && (
                         <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-xs font-bold uppercase">Geen verkopers gevonden</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard;