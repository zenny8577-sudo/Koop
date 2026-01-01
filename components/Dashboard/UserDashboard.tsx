
import React, { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import { Product, Transaction, ProductStatus, ProductCondition } from '../../types';
import { db } from '../../services/db';
import { currentUser } from '../../services/mockData';

const UserDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'Elektronica',
    condition: ProductCondition.LIKE_NEW,
    description: ''
  });

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    const allProducts = db.getAllProductsAdmin();
    setProducts(allProducts.filter(p => p.sellerId === currentUser.id));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    db.createProduct({
      title: newProduct.title,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      condition: newProduct.condition,
      description: newProduct.description,
      sellerId: currentUser.id,
      status: ProductStatus.PENDING_APPROVAL, // Vendedores sempre começam como pendente
      image: 'https://images.unsplash.com/photo-1517336714467-d13a863b17e9?auto=format&fit=crop&q=80&w=800',
      commissionRate: 0.15,
      commissionAmount: parseFloat(newProduct.price) * 0.15,
    });
    
    refresh();
    setShowAddModal(false);
    setNewProduct({ title: '', price: '', category: 'Elektronica', condition: ProductCondition.LIKE_NEW, description: '' });
    alert("Uw item is ingediend e wacht op goedkeuring door onze experts.");
  };

  const stats = {
    balance: products.filter(p => p.status === ProductStatus.SOLD).reduce((acc, p) => acc + (p.price - p.commissionAmount), 0),
    activeCount: products.filter(p => p.status === ProductStatus.ACTIVE).length,
    pendingCount: products.filter(p => p.status === ProductStatus.PENDING_APPROVAL).length,
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Mijn Dashboard<span className="text-[#FF4F00]">.</span></h1>
          <p className="text-slate-500 font-medium mt-4 uppercase text-[10px] tracking-widest font-black">Status: Geverifieerd Verkoper</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-[#FF4F00] transition-all shadow-xl"
        >
          Nieuw Item Toevoegen
        </button>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <p className="text-4xl font-black tracking-tighter text-slate-900">€ {stats.balance.toLocaleString()}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Verdiensten</p>
        </div>
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <p className="text-4xl font-black tracking-tighter text-emerald-500">{stats.activeCount}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Live Items</p>
        </div>
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <p className={`text-4xl font-black tracking-tighter ${stats.pendingCount > 0 ? 'text-[#FF4F00]' : 'text-slate-300'}`}>{stats.pendingCount}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Wacht op Goedkeuring</p>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm">
        <div className="px-10 py-10 border-b border-slate-50">
          <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900">Mijn Inventaris</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-10 py-6">Item</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Prijs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-10 py-24 text-center text-slate-300 font-black uppercase tracking-widest text-xs italic">Geen producten gevonden.</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-8 flex items-center gap-6">
                      <img src={p.image} className="w-16 h-16 rounded-2xl object-cover bg-slate-100" />
                      <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{p.title}</span>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        p.status === ProductStatus.ACTIVE ? 'bg-emerald-50 text-emerald-500' : 
                        p.status === ProductStatus.PENDING_APPROVAL ? 'bg-orange-50 text-[#FF4F00]' : 
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right font-black text-slate-900">€{p.price.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simplified Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowAddModal(false)} />
          <form onSubmit={handleAddProduct} className="relative bg-white w-full max-w-2xl p-12 lg:p-16 rounded-[60px] shadow-2xl space-y-10">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Item Aanmelden</h2>
            <div className="space-y-6">
              <input required placeholder="TITEL" className="w-full bg-slate-50 p-6 rounded-3xl font-bold uppercase text-sm outline-none focus:ring-4 focus:ring-orange-500/10" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} />
              <input required placeholder="PRIJS (€)" type="number" className="w-full bg-slate-50 p-6 rounded-3xl font-bold uppercase text-sm outline-none focus:ring-4 focus:ring-orange-500/10" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <textarea required placeholder="OMSCHRIJVING" className="w-full bg-slate-50 p-6 rounded-3xl font-bold uppercase text-sm outline-none h-32" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
            </div>
            <button type="submit" className="w-full py-8 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest text-[12px] shadow-2xl hover:bg-[#FF4F00] transition-all">Ter Goedkeuring Verzenden</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
