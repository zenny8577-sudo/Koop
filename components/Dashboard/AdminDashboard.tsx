
import React, { useState } from 'react';
import { db } from '../../services/db';
import { Product, ProductStatus, ProductCondition } from '../../types';

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'inventory' | 'queue' | 'settings'>('inventory');
  const [products, setProducts] = useState<Product[]>(db.getAllProductsAdmin());
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const metrics = db.getAdminMetrics();

  const [formState, setFormState] = useState({
    title: '',
    price: 0,
    category: 'Elektronica',
    condition: ProductCondition.LIKE_NEW,
    image: '',
    description: '',
    sku: '',
    stripeLink: '',
    tags: '',
    internalNote: '',
    status: ProductStatus.ACTIVE
  });

  const handleDelete = (id: string) => {
    if (confirm('Zeker weten? Dit kan niet ongedaan worden gemaakt.')) {
      db.deleteProduct(id);
      refresh();
    }
  };

  const handleApprove = (id: string) => {
    db.approveProduct(id);
    refresh();
  };

  const handleReject = (id: string) => {
    db.rejectProduct(id);
    refresh();
  };

  const refresh = () => {
    setProducts(db.getAllProductsAdmin());
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormState({
      title: product.title,
      price: product.price,
      category: product.category,
      condition: product.condition,
      image: product.image,
      description: product.description,
      sku: product.sku || '',
      stripeLink: product.stripeLink || '',
      tags: product.tags?.join(', ') || '',
      internalNote: product.internalNote || '',
      status: product.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formState,
      tags: formState.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      commissionAmount: formState.price * 0.15
    };

    if (editingProduct) {
      db.updateProduct(editingProduct.id, payload as any);
    } else {
      db.createProduct({
        ...payload,
        sellerId: 'admin_1',
        commissionRate: 0.15,
      } as any);
    }
    refresh();
    setShowModal(false);
    setEditingProduct(null);
  };

  const renderQueue = () => {
    const pending = products.filter(p => p.status === ProductStatus.PENDING_APPROVAL);
    return (
      <div className="space-y-12 animate-fadeIn">
        <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-10 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Goedkeuringswachtrij</h2>
            <span className="bg-orange-50 text-[#FF4F00] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{pending.length} Items</span>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <tbody className="divide-y divide-slate-50">
                 {pending.length === 0 ? (
                   <tr>
                     <td className="px-10 py-20 text-center text-slate-400 font-medium">Geen items die wachten op goedkeuring.</td>
                   </tr>
                 ) : (
                   pending.map(p => (
                     <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-8 flex items-center gap-8">
                          <img src={p.image} className="w-24 h-24 rounded-3xl object-cover bg-slate-100 shadow-sm" />
                          <div>
                            <span className="text-lg font-black text-slate-900 block leading-tight">{p.title}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-1">Door: {p.sellerId} • {p.category}</span>
                            <p className="text-sm font-medium text-slate-500 mt-2 line-clamp-1 max-w-md">{p.description}</p>
                          </div>
                        </td>
                        <td className="px-10 py-8 font-black text-slate-900">€{p.price.toLocaleString()}</td>
                        <td className="px-10 py-8 text-right space-x-3">
                          <button onClick={() => handleApprove(p.id)} className="px-6 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-600 transition-all">Goedkeuren</button>
                          <button onClick={() => handleReject(p.id)} className="px-6 py-3 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all">Afwijzen</button>
                        </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    );
  };

  const renderInventory = () => (
    <div className="space-y-12 animate-fadeIn">
      <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Alle Producten</h2>
          <div className="flex gap-4">
            <input type="text" placeholder="Zoek op titel..." className="bg-slate-50 border-none rounded-2xl px-6 py-3 text-sm font-bold outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-10 py-8">Product</th>
                <th className="px-10 py-8">Prijs</th>
                <th className="px-10 py-8">Status</th>
                <th className="px-10 py-8 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6 flex items-center gap-6">
                    <img src={p.image || 'https://placehold.co/100x100?text=No+Image'} className="w-16 h-16 rounded-2xl object-cover bg-slate-100" />
                    <div>
                      <span className="text-sm font-black text-slate-900 block">{p.title}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SKU: {p.sku || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 font-black text-slate-900 text-sm">€{p.price.toLocaleString()}</td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      p.status === ProductStatus.ACTIVE ? 'bg-emerald-50 text-emerald-500' : 
                      p.status === ProductStatus.PENDING_APPROVAL ? 'bg-orange-50 text-[#FF4F00]' : 
                      'bg-slate-50 text-slate-400'
                    }`}>{p.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-10 py-6 text-right space-x-2">
                    <button onClick={() => handleEdit(p)} className="p-3 text-slate-400 hover:text-slate-900 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    <button onClick={() => handleDelete(p.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 animate-fadeIn pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Platform Controle<span className="text-[#FF4F00]">.</span></h1>
          <nav className="flex gap-8 mt-6">
            <button onClick={() => setActiveView('inventory')} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeView === 'inventory' ? 'text-[#FF4F00] border-b-2 border-[#FF4F00] pb-2' : 'text-slate-400 hover:text-slate-900'}`}>Inventaris</button>
            <button onClick={() => setActiveView('queue')} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeView === 'queue' ? 'text-[#FF4F00] border-b-2 border-[#FF4F00] pb-2' : 'text-slate-400 hover:text-slate-900'}`}>
              Wachtrij {metrics.pendingProducts > 0 && `(${metrics.pendingProducts})`}
            </button>
            <button onClick={() => setActiveView('settings')} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeView === 'settings' ? 'text-[#FF4F00] border-b-2 border-[#FF4F00] pb-2' : 'text-slate-400 hover:text-slate-900'}`}>Instellingen</button>
          </nav>
        </div>
        <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-[#FF4F00] transition-all shadow-xl">Handmatige Listing</button>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Platform Omzet', val: `€ ${metrics.totalRevenue.toLocaleString()}`, color: 'text-slate-900' },
          { label: 'Wacht op Check', val: metrics.pendingProducts, color: metrics.pendingProducts > 0 ? 'text-[#FF4F00]' : 'text-slate-400' },
          { label: 'Actieve Items', val: metrics.activeProducts, color: 'text-emerald-500' },
          { label: 'Totaal Verkocht', val: metrics.soldItems, color: 'text-slate-900' },
        ].map(s => (
          <div key={s.label} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <p className={`text-3xl font-black tracking-tighter ${s.color}`}>{s.val}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {activeView === 'inventory' ? renderInventory() : activeView === 'queue' ? renderQueue() : null}

      {/* Manual Modal - Simplified for brevity in this turn */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowModal(false)} />
          <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-4xl p-12 lg:p-16 rounded-[60px] shadow-2xl space-y-12 overflow-y-auto max-h-[90vh]">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Product Toevoegen (Admin)</h2>
            <div className="grid grid-cols-2 gap-8">
               <input placeholder="TITEL" className="w-full bg-slate-50 p-6 rounded-2xl font-bold" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} />
               <input placeholder="PRIJS" type="number" className="w-full bg-slate-50 p-6 rounded-2xl font-bold" value={formState.price} onChange={e => setFormState({...formState, price: parseFloat(e.target.value)})} />
               <input placeholder="IMAGE URL" className="w-full bg-slate-50 p-6 rounded-2xl font-bold col-span-2" value={formState.image} onChange={e => setFormState({...formState, image: e.target.value})} />
               <textarea placeholder="DESCRIPTION" className="w-full bg-slate-50 p-6 rounded-2xl font-bold col-span-2 h-40" value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} />
            </div>
            <button className="w-full py-7 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest hover:bg-[#FF4F00] transition-all">Item Live Zetten</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
