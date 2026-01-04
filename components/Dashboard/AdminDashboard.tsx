import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/integrations/supabase/client';
import { Product, User, Transaction } from '../../types';
import { mockProducts, mockTransactions } from '../../services/mockData';

import AdminOverview from '../Admin/AdminOverview';
import AdminProducts from '../Admin/AdminProducts';
import AdminCategories from '../Admin/AdminCategories';
import AdminImport from '../Admin/AdminImport';
import AdminUsers from '../Admin/AdminUsers';
import AdminSellers from '../Admin/AdminSellers';
import AdminSettings from '../Admin/AdminSettings';

interface AdminDashboardProps {
  onDataChange?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onDataChange }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'import' | 'users' | 'sellers' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [apiKeys, setApiKeys] = useState({
    openRouter: localStorage.getItem('koop_openrouter_key') || '',
    stripe: localStorage.getItem('koop_stripe_key') || ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      const { data: txData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      
      let allProducts = productsData || [];
      
      // LOGICA DE DEDUPLICAÇÃO INTELIGENTE
      // Se tivermos poucos produtos reais, misturamos com os mocks para o painel não ficar vazio.
      // MAS, filtramos os mocks cujo TÍTULO já existe nos produtos reais.
      // Assim, ao aprovar um mock, ele vira real, e o mock original some da lista.
      if (allProducts.length < 20) {
          const realTitles = new Set(allProducts.map(p => p.title.trim().toLowerCase()));
          const realIds = new Set(allProducts.map(p => p.id));
          
          const mocksToAdd = mockProducts.filter(m => {
             const titleExists = realTitles.has(m.title.trim().toLowerCase());
             const idExists = realIds.has(m.id);
             return !titleExists && !idExists;
          });
          
          allProducts = [...allProducts, ...mocksToAdd];
      }
      
      let allTransactions = txData || [];
      if (allTransactions.length === 0) {
          allTransactions = [...mockTransactions];
      }

      setProducts(allProducts);
      setUsers(usersData || []);
      setTransactions(allTransactions);

    } catch (err) {
      console.error('Admin load error:', err);
      setProducts(mockProducts);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData(); // Atualiza Admin
    if (onDataChange) onDataChange(); // Atualiza App (Loja)
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
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {activeTab === 'overview' && <AdminOverview products={products} users={users} transactions={transactions} />}
      {activeTab === 'products' && <AdminProducts products={products} loading={loading} onRefresh={handleRefresh} />}
      {activeTab === 'categories' && <AdminCategories />}
      {activeTab === 'import' && <AdminImport apiKeys={apiKeys} onImportSuccess={handleRefresh} onRequestSettings={() => setActiveTab('settings')} />}
      {activeTab === 'users' && <AdminUsers users={users} />}
      {activeTab === 'sellers' && <AdminSellers users={users} onUpdate={loadData} />}
      {activeTab === 'settings' && <AdminSettings apiKeys={apiKeys} setApiKeys={setApiKeys} />}
    </div>
  );
};

export default AdminDashboard;