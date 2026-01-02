
import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Product, ProductStatus, ProductCondition, VerificationResult, User, VerificationStatus } from '../../types';

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'inventory' | 'queue' | 'verifications' | 'analytics'>('inventory');
  const [products, setProducts] = useState<Product[]>(db.getAllProductsAdmin());
  const [pendingVerifications, setPendingVerifications] = useState<User[]>(db.getPendingVerifications());
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedVerifyProduct, setSelectedVerifyProduct] = useState<Product | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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
    barcode: '',
    size: 'M',
    weight: 1.0,
    tags: '',
    internalNote: '',
    status: ProductStatus.ACTIVE
  });

  const refresh = () => {
    setProducts(db.getAllProductsAdmin());
    setPendingVerifications(db.getPendingVerifications());
  };

  const handleUpdateSellerVerification = (userId: string, status: VerificationStatus) => {
    db.updateUserVerification(userId, status);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bent u zeker dat u dit item wilt verwijderen?')) {
      db.deleteProduct(id);
      refresh();
    }
  };

  const handleApprove = (id: string) => {
    db.approveProduct(id);
    refresh();
    setSelectedVerifyProduct(null);
  };

  const handleReject = (id: string) => {
    db.rejectProduct(id);
    refresh();
    setSelectedVerifyProduct(null);
  };

  const handleSyncWoo = async () => {
    setIsSyncing(true);
    await db.syncWooCommerce(5);
    setTimeout(() => {
      setIsSyncing(false);
      refresh();
    }, 1500);
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
      barcode: product.barcode || '',
      size: product.size || 'M',
      weight: product.weight || 1.0,
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
      commissionAmount: formState.price * (formState.price > 1000 ? 0.08 : 0.15),
      commissionRate: formState.price > 1000 ? 0.08 : 0.15
    };

    if (editingProduct) {
      db.updateProduct(editingProduct.id, payload as any);
    } else {
      db.createProduct({
        ...payload,
        sellerId: 'admin_1',
      } as any);
    }
    refresh();
    setShowModal(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderVerificationReport = (p: Product) => {
    const report = p.verification || db.verifyProductOnly(p.id);
    if (!report) return null;

    return (
      <div className="mt-8 p-10 bg-slate-50 rounded-[48px] border border-slate-100 animate-fadeIn space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Curatie Analyse</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gegenereerd op {new Date(report.verifiedAt).toLocaleDateString('nl-NL')}</p>
          </div>
          <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${report.overallPassed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
            {report.overallPassed ? 'Klaar voor Publicatie' : 'Handmatige Review Vereist'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Authenticiteit', data: report.authenticity },
            { label: 'Item Conditie', data: report.condition },
            { label: 'Marktwaarde', data: report.priceFairness },
            { label: 'Wetgeving (NL)', data: report.legalCompliance },
          ].map(check => (
            <div key={check.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{check.label}</span>
                <span className={`text-[11px] font-black ${check.data.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {Math.round(check.data.score * 100)}% Match
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700 leading-relaxed">{check.data.message}</p>
              <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${check.data.passed ? 'bg-emerald-400' : 'bg-rose-400'}`} 
                  style={{ width: `${check.data.score * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
           <button onClick={() => handleApprove(p.id)} className="flex-1 py-6 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-[#FF4F00] transition-all shadow-xl shadow-slate-200">Keur Goed e Publiceer</button>
           <button onClick={() => handleReject(p.id)} className="flex-1 py-6 bg-white text-rose-500 border border-rose-100 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-50 transition-all">Verwijder uit Wachtrij</button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-12 animate-fadeIn pb-40">
      {/* Premium Header */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 pb-12 border-b border-slate-100">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-[#FF4F00] animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Koop Admin Console</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-slate-950 tracking-tighter uppercase leading-[0.85]">
            Marketplace <br /> <span className="text-[#FF4F00]">Operations.</span>
          </h1>
          <nav className="flex gap-10 pt-4">
            {[
              { id: 'inventory', label: 'Voorraad' },
              { id: 'queue', label: `Wachtrij (${metrics.pendingProducts})` },
              { id: 'verifications', label: `Sellers (${pendingVerifications.length})` },
              { id: 'analytics', label: 'Rapportage' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)} 
                className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all relative pb-2 group ${activeView === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
                <div className={`absolute bottom-0 left-0 h-1 bg-[#FF4F00] transition-all duration-500 ${activeView === tab.id ? 'w-full' : 'w-0 group-hover:w-4'}`} />
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap gap-4">
           <button 
             onClick={handleSyncWoo}
             disabled={isSyncing}
             className="px-10 py-6 bg-white border border-slate-200 text-slate-900 rounded-[32px] font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 disabled:opacity-50"
           >
             {isSyncing ? (
               <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
             ) : (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             )}
             WooCommerce Sync
           </button>
           <button 
             onClick={() => { setEditingProduct(null); setShowModal(true); }} 
             className="px-12 py-6 bg-slate-950 text-white rounded-[32px] font-black text-[11px] uppercase tracking-widest hover:bg-[#FF4F00] transition-all shadow-2xl shadow-slate-200 transform hover:-translate-y-1"
           >
             Nieuw Item +
           </button>
        </div>
      </header>

      {/* Dynamic Dashboard Content */}
      {activeView === 'inventory' && (
        <div className="space-y-12">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Bruto Waarde', val: `€${metrics.totalRevenue.toLocaleString()}`, change: '+12%', pos: true },
              { label: 'Actieve Listings', val: metrics.activeProducts, change: '+5', pos: true },
              { label: 'Verkocht Totaal', val: metrics.soldItems, change: '-2%', pos: false },
              { label: 'Admin Commissie', val: `€${(metrics.totalRevenue * 0.12).toLocaleString()}`, change: 'High', pos: true },
            ].map(m => (
              <div key={m.label} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-4xl font-black text-slate-950 tracking-tighter">{m.val}</p>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${m.pos ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>{m.change}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-[#FF4F00] transition-colors">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Inventory Table Container */}
          <div className="bg-white rounded-[60px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-12 py-10 border-b border-slate-50 flex flex-wrap justify-between items-center gap-6">
               <h3 className="text-xl font-black uppercase tracking-tighter">Voorraad Beheer</h3>
               <div className="flex gap-4 flex-1 max-w-xl">
                  <div className="relative flex-1">
                    <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                      type="text" 
                      placeholder="Zoek op naam, SKU of tag..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all" 
                    />
                  </div>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="px-12 py-8">Product Details</th>
                    <th className="px-12 py-8">Prijs & Commissie</th>
                    <th className="px-12 py-8 text-center">Specificaties</th>
                    <th className="px-12 py-8 text-center">Status</th>
                    <th className="px-12 py-8 text-right">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-12 py-8">
                        <div className="flex items-center gap-6">
                           <div className="relative shrink-0">
                              <img src={p.image} className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-100" />
                              {p.verification?.overallPassed && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF4F00] rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                </div>
                              )}
                           </div>
                           <div className="space-y-1">
                              <span className="text-sm font-black text-slate-900 uppercase tracking-tight block group-hover:text-[#FF4F00] transition-colors">{p.title}</span>
                              <div className="flex gap-2">
                                <span className="text-[9px] font-black uppercase text-slate-400 px-2 py-0.5 bg-slate-50 rounded">SKU: {p.sku || '---'}</span>
                                <span className="text-[9px] font-black uppercase text-slate-400 px-2 py-0.5 bg-slate-50 rounded">{p.category}</span>
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-12 py-8">
                        <p className="text-sm font-black text-slate-900">€ {p.price.toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Marge: € {p.commissionAmount.toFixed(2)}</p>
                      </td>
                      <td className="px-12 py-8 text-center">
                         <span className="text-[10px] font-black text-slate-600 block uppercase">{p.size || 'Standard'}</span>
                         <span className="text-[9px] font-bold text-slate-400 block mt-1 uppercase tracking-widest">{p.weight ? `${p.weight}kg` : 'No weight'}</span>
                      </td>
                      <td className="px-12 py-8 text-center">
                         <div className="flex flex-col items-center gap-1">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${
                             p.status === ProductStatus.ACTIVE ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' :
                             p.status === ProductStatus.PENDING_APPROVAL ? 'bg-orange-50 text-[#FF4F00] border border-orange-100' :
                             'bg-slate-100 text-slate-400 border border-slate-200'
                           }`}>
                             {p.status.replace('_', ' ')}
                           </span>
                           {p.status === ProductStatus.ACTIVE && (
                             <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">LIVE IN STORE</span>
                           )}
                         </div>
                      </td>
                      <td className="px-12 py-8 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                           <button onClick={() => handleEdit(p)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                           </button>
                           <button onClick={() => handleDelete(p.id)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm text-slate-300 hover:text-rose-500 hover:border-rose-100 transition-all">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === 'queue' && (
        <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
          <div className="text-center space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase">Curatie Wachtrij</h2>
            <p className="text-slate-400 font-medium text-lg uppercase tracking-widest text-sm">Items die wachten op expert-review</p>
          </div>

          <div className="space-y-6">
            {products.filter(p => p.status === ProductStatus.PENDING_APPROVAL).length === 0 ? (
              <div className="py-40 bg-slate-50 rounded-[80px] text-center space-y-6 border border-slate-100">
                <div className="text-6xl grayscale opacity-30">✨</div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Alles is bijgewerkt!</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Geen nieuwe items ter review</p>
              </div>
            ) : (
              products.filter(p => p.status === ProductStatus.PENDING_APPROVAL).map(p => (
                <div key={p.id} className="bg-white rounded-[60px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700">
                   <div className="p-12 flex flex-col lg:flex-row items-center justify-between gap-12">
                      <div className="flex items-center gap-10">
                         <img src={p.image} className="w-32 h-32 rounded-[40px] object-cover shadow-2xl rotate-3 group-hover:rotate-0 transition-transform" />
                         <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">{p.category}</span>
                            <h4 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{p.title}</h4>
                            <div className="flex gap-8">
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Prijs</p>
                                  <p className="text-lg font-black text-slate-900">€ {p.price.toLocaleString()}</p>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">ID</p>
                                  <p className="text-lg font-black text-slate-900">{p.id.split('-')[1]}</p>
                               </div>
                            </div>
                         </div>
                      </div>
                      <button 
                        onClick={() => setSelectedVerifyProduct(selectedVerifyProduct?.id === p.id ? null : p)}
                        className={`px-12 py-6 rounded-[32px] font-black text-[11px] uppercase tracking-widest transition-all shadow-xl ${selectedVerifyProduct?.id === p.id ? 'bg-[#FF4F00] text-white shadow-orange-500/20' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
                      >
                        {selectedVerifyProduct?.id === p.id ? 'Sluit Rapport' : 'Bekijk Verificatie'}
                      </button>
                   </div>
                   {selectedVerifyProduct?.id === p.id && (
                     <div className="px-12 pb-12 border-t border-slate-50">
                       {renderVerificationReport(p)}
                     </div>
                   )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeView === 'verifications' && (
        <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
          <div className="text-center space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase">Seller Verificaties</h2>
            <p className="text-slate-400 font-medium text-lg uppercase tracking-widest text-sm">KYC review voor premium verkopers</p>
          </div>

          <div className="space-y-6">
            {pendingVerifications.length === 0 ? (
              <div className="py-40 bg-slate-50 rounded-[80px] text-center space-y-6 border border-slate-100">
                <div className="text-6xl grayscale opacity-30">🛡️</div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Geen openstaande KYC's</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Alle verkopers zijn gescreend</p>
              </div>
            ) : (
              pendingVerifications.map(u => (
                <div key={u.id} className="bg-white rounded-[60px] border border-slate-100 p-12 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-sm hover:shadow-xl transition-all duration-700">
                   <div className="flex items-center gap-10">
                      <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-white font-black text-3xl">
                        {(u.firstName || u.email)[0].toUpperCase()}
                      </div>
                      <div className="space-y-4">
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Pending Identity Review</span>
                         <h4 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{u.firstName} {u.lastName}</h4>
                         <p className="text-sm font-bold text-slate-400">{u.email}</p>
                      </div>
                   </div>

                   <div className="flex flex-col gap-4 min-w-[300px]">
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase text-slate-400">Documenten</span>
                         <span className="text-[10px] font-black text-emerald-500 uppercase">Aanwezig (2)</span>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => handleUpdateSellerVerification(u.id, 'verified')} className="flex-1 py-5 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all">Goedkeuren</button>
                        <button onClick={() => handleUpdateSellerVerification(u.id, 'rejected')} className="flex-1 py-5 bg-rose-50 text-rose-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-rose-100 transition-all">Afwijzen</button>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeView === 'analytics' && (
        <div className="py-40 text-center space-y-8 bg-slate-50 rounded-[80px] border border-slate-100 animate-fadeIn">
           <div className="text-8xl grayscale">📊</div>
           <div className="space-y-2">
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Gedetailleerde Statistieken</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Binnenkort beschikbaar in versie 2.0</p>
           </div>
           <button onClick={() => setActiveView('inventory')} className="px-10 py-5 bg-slate-950 text-white rounded-full font-black uppercase tracking-widest text-[10px]">Terug naar Dashboard</button>
        </div>
      )}

      {/* Global Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" onClick={() => setShowModal(false)} />
          <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-6xl p-16 lg:p-24 rounded-[80px] shadow-3xl overflow-y-auto max-h-[92vh]">
            <header className="flex justify-between items-start mb-20">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">Master Listing Setup</span>
                <h2 className="text-6xl lg:text-7xl font-black uppercase tracking-tighter text-slate-950 leading-[0.85]">
                  {editingProduct ? 'Edit Item' : 'New Premium Item'}
                </h2>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
               <div className="lg:col-span-4 space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-4">Visual asset (URL)</label>
                    <div className="aspect-square rounded-[60px] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden group shadow-inner">
                      {formState.image ? (
                        <img src={formState.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                      ) : (
                        <div className="text-center space-y-3 opacity-20">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <p className="text-[10px] font-black uppercase tracking-widest">Geen Afbeelding</p>
                        </div>
                      )}
                    </div>
                    <input required placeholder="https://unsplash.com/..." className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-bold text-xs outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all" value={formState.image} onChange={e => setFormState({...formState, image: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-4">Maat</label>
                        <input placeholder="bijv. L / 42" className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-bold text-xs outline-none" value={formState.size} onChange={e => setFormState({...formState, size: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-4">Gewicht (KG)</label>
                        <input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-bold text-xs outline-none" value={formState.weight} onChange={e => setFormState({...formState, weight: parseFloat(e.target.value)})} />
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-8 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-4">Item Naam</label>
                      <input required placeholder="APPLE MACBOOK PRO M3" className="w-full bg-slate-50 border border-slate-100 p-8 rounded-[32px] font-black text-lg outline-none uppercase tracking-tight focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-4">Catalogus Prijs (€)</label>
                      <input required type="number" placeholder="0.00" className="w-full bg-slate-50 border border-slate-100 p-8 rounded-[32px] font-black text-lg outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all" value={formState.price} onChange={e => setFormState({...formState, price: parseFloat(e.target.value)})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-4">Categorie</label>
                        <select className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-black text-[10px] uppercase tracking-widest outline-none" value={formState.category} onChange={e => setFormState({...formState, category: e.target.value})}>
                          {db.getCategories().map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-4">Conditie</label>
                        <select className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-black text-[10px] uppercase tracking-widest outline-none" value={formState.condition} onChange={e => setFormState({...formState, condition: e.target.value as any})}>
                          {Object.values(ProductCondition).map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-4">Status</label>
                        <select className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-black text-[10px] uppercase tracking-widest outline-none" value={formState.status} onChange={e => setFormState({...formState, status: e.target.value as any})}>
                          {Object.values(ProductStatus).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-4">Publieke Omschrijving</label>
                    <textarea required placeholder="Beschrijf de staat, details e extra's..." className="w-full bg-slate-50 border border-slate-100 p-8 rounded-[32px] font-bold text-sm outline-none h-40 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all" value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} />
                  </div>

                  <div className="pt-6">
                    <button type="submit" className="w-full py-9 bg-slate-950 text-white font-black rounded-full uppercase tracking-[0.3em] text-[13px] shadow-3xl hover:bg-[#FF4F00] transition-all transform hover:-translate-y-1">
                      {editingProduct ? 'Update Item Informatie' : 'Nieuw Item Publiceren'}
                    </button>
                  </div>
               </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
