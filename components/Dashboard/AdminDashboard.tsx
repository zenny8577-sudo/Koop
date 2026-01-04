import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/integrations/supabase/client';
import { Product, User, ProductStatus } from '../../types';
import { mockProducts } from '../../services/mockData';

// Imported modular components
import AdminOverview from '../Admin/AdminOverview';
import AdminProducts from '../Admin/AdminProducts';
import AdminCategories from '../Admin/AdminCategories';
import AdminImport from '../Admin/AdminImport';
import AdminUsers from '../Admin/AdminUsers';
import AdminSellers from '../Admin/AdminSellers';
import AdminSettings from '../Admin/AdminSettings';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'import' | 'users' | 'sellers' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings State
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
      
      // Fallback to mocks if DB is empty
      let allProducts = productsData || [];
      if (allProducts.length === 0) {
          allProducts = [...mockProducts];
      }
      
      setProducts(allProducts);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Admin load error:', err);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
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
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Render Active Tab */}
      {activeTab === 'overview' && <AdminOverview products={products} users={users} />}
      {activeTab === 'products' && <AdminProducts products={products} loading={loading} onRefresh={loadData} />}
      {activeTab === 'categories' && <AdminCategories />}
      {activeTab === 'import' && <AdminImport apiKeys={apiKeys} onImportSuccess={loadData} onRequestSettings={() => setActiveTab('settings')} />}
      {activeTab === 'users' && <AdminUsers users={users} />}
      {activeTab === 'sellers' && <AdminSellers users={users} onUpdate={loadData} />}
      {activeTab === 'settings' && <AdminSettings apiKeys={apiKeys} setApiKeys={setApiKeys} />}
    </div>
  );
};

export default AdminDashboard;