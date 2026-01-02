
import React, { useState, useEffect } from 'react';
import { Product, ProductStatus, ProductCondition, User } from '../../types';
import { db } from '../../services/db';
import ProfileSettings from '../Profile/ProfileSettings';

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'analytics' | 'profile'>('inventory');
  const [user, setUser] = useState<User>(db.getUser('user_123'));
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'Elektronica',
    condition: ProductCondition.LIKE_NEW,
    description: '',
    image: 'https://images.unsplash.com/photo-1517336714467-d13a863b17e9?auto=format&fit=crop&q=80&w=800'
  });

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    const allProducts = db.getAllProductsAdmin();
    setProducts(allProducts.filter(p => p.sellerId === user.id));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      db.createProduct({
        title: newProduct.title,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        condition: newProduct.condition,
        description: newProduct.description,
        sellerId: user.id,
        status: ProductStatus.PENDING_APPROVAL,
        image: newProduct.image,
        commissionRate: 0.15,
        commissionAmount: parseFloat(newProduct.price) * 0.15,
      });
      refresh();
      setIsLoading(false);
      setShowAddModal(false);
      setNewProduct({ title: '', price: '', category: 'Elektronica', condition: ProductCondition.LIKE_NEW, description: '', image: 'https://images.unsplash.com/photo-1517336714467-d13a863b17e9?auto=format&fit=crop&q=80&w=800' });
      alert("Bedankt! Uw item is ingediend e wordt door onze curatoren gecontroleerd.");
    }, 1000);
  };

  const stats = {
    totalSales: products.filter(p => p.status === ProductStatus.SOLD).reduce((acc, p) => acc + p.price, 0),
    netEarnings: products.filter(p => p.status === ProductStatus.SOLD).reduce((acc, p) => acc + (p.price - p.commissionAmount), 0),
    activeCount: products.filter(p => p.status === ProductStatus.ACTIVE).length,
    pendingCount: products.filter(p => p.status === ProductStatus.PENDING_APPROVAL).length,
  };

  return (
    <div className="space-y-16 animate-fadeIn pb-40">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Verkoper Dashboard</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-950 tracking-tighter uppercase leading-[0.85]">
            Mijn <br /> <span className="text-[#FF4F00]">Handel.</span>
          </h1>
          <nav className="flex gap-10 pt-4">
            {[
              { id: 'inventory', label: 'Inventaris' },
              { id: 'analytics', label: 'Verkoopcijfers' },
              { id: 'profile', label: 'Profiel' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all relative pb-2 group ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
                <div className={`absolute bottom-0 left-0 h-1 bg-[#FF4F00] transition-all duration-500 ${activeTab === tab.id ? 'w-full' : 'w-0 group-hover:w-4'}`} />
              </button>
            ))}
          </nav>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-12 py-6 bg-slate-950 text-white rounded-[32px] font-black text-[11px] uppercase tracking-widest hover:bg-[#FF4F00] transition-all shadow-2xl"
        >
          Nieuw Item Toevoegen +
        </button>
      </header>

      {activeTab === 'inventory' && (
        <div className="space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Netto Verdiensten', val: `€${stats.netEarnings.toLocaleString()}`, color: 'text-slate-950' },
              { label: 'Bruto Omzet', val: `€${stats.totalSales.toLocaleString()}`, color: 'text-slate-400' },
              { label: 'Live Listings', val: stats.activeCount, color: 'text-emerald-500' },
              { label: 'In Review', val: stats.pendingCount, color: stats.pendingCount > 0 ? 'text-[#FF4F00]' : 'text-slate-200' },
            ].map(m => (
              <div key={m.label} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                <p className={`text-4xl font-black tracking-tighter ${m.color}`}>{m.val}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[60px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter text-slate-950">Mijn Inventaris</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{products.length} Items Totaal</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="px-12 py-8">Product</th>
                    <th className="px-12 py-8 text-center">Categorie</th>
                    <th className="px-12 py-8 text-center">Status</th>
                    <th className="px-12 py-8 text-right">Prijs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.length === 0 ? (
                    <tr><td colSpan={4} className="px-12 py-32 text-center text-slate-300 font-black uppercase tracking-widest">Leeg</td></tr>
                  ) : (
                    products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-12 py-8">
                          <div className="flex items-center gap-6">
                            <img src={p.image} className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border border-slate-100 shadow-sm" alt={p.title} />
                            <div className="space-y-1">
                              <span className="text-sm font-black text-slate-900 uppercase tracking-tight block group-hover:text-[#FF4F00] transition-colors">{p.title}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {p.id.split('-')[1]}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-12 py-8 text-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.category}</span></td>
                        <td className="px-12 py-8 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.status === ProductStatus.ACTIVE ? 'bg-emerald-50 text-emerald-500' : p.status === ProductStatus.SOLD ? 'bg-slate-950 text-white' : 'bg-orange-50 text-[#FF4F00]'}`}>{p.status.replace('_', ' ')}</span>
                        </td>
                        <td className="px-12 py-8 text-right font-black text-slate-950 text-base">€ {p.price.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-slate-950 rounded-[80px] p-20 text-white animate-fadeIn space-y-20">
           <div className="flex justify-between items-end">
              <div className="space-y-4">
                 <h2 className="text-5xl font-black uppercase tracking-tighter">Omzet Groei.</h2>
                 <p className="text-white/40 font-medium">Prestaties van de afgelopen 30 dagen</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#FF4F00] mb-2">Huidige Maand</p>
                 <p className="text-6xl font-black">€ {stats.totalSales.toLocaleString()}</p>
              </div>
           </div>
           <div className="h-64 flex items-end gap-4">
              {[60, 45, 80, 55, 90, 70, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-white/5 rounded-t-3xl relative group hover:bg-[#FF4F00]/20 transition-all duration-500">
                   <div className="absolute bottom-0 left-0 w-full bg-[#FF4F00] rounded-t-3xl transition-all duration-1000 group-hover:shadow-[0_-20px_40px_rgba(255,79,0,0.3)]" style={{ height: `${h}%` }} />
                </div>
              ))}
           </div>
           <div className="grid grid-cols-3 gap-12 pt-12 border-t border-white/5">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Conversie</p>
                 <p className="text-3xl font-black text-emerald-400">12.4%</p>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Gem. Orderwaarde</p>
                 <p className="text-3xl font-black">€ 1.250</p>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Bezoekers</p>
                 <p className="text-3xl font-black">2.4k</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'profile' && <ProfileSettings user={user} onUpdate={handleUpdateUser} />}

      {showAddModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" onClick={() => !isLoading && setShowAddModal(false)} />
          <form onSubmit={handleAddProduct} className="relative bg-white w-full max-w-4xl p-16 lg:p-24 rounded-[80px] shadow-3xl overflow-y-auto max-h-[92vh]">
            <header className="flex justify-between items-start mb-16">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">Curatie Aanvraag</span>
                <h2 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter text-slate-950 leading-[0.85]">Item <br /> Aanmelden.</h2>
              </div>
              <button type="button" disabled={isLoading} onClick={() => setShowAddModal(false)} className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-950 hover:text-white transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <input required placeholder="TITEL" className="w-full bg-slate-50 border-none rounded-[32px] p-8 font-black text-lg outline-none" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} />
                <input required placeholder="PRIJS" type="number" className="w-full bg-slate-50 border-none rounded-[32px] p-8 font-black text-lg outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              </div>
              <textarea required placeholder="OMSCHRIJVING" className="w-full bg-slate-50 border-none rounded-[32px] p-8 font-bold text-sm outline-none h-full" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              <div className="lg:col-span-2 pt-6">
                <button type="submit" disabled={isLoading} className="w-full py-9 bg-slate-950 text-white font-black rounded-full uppercase tracking-[0.3em] text-[13px] shadow-3xl hover:bg-[#FF4F00] transition-all">{isLoading ? 'Verzenden...' : 'Indienen ter Goedkeuring'}</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
