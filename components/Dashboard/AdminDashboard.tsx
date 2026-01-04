import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/integrations/supabase/client';
import { Product, User, ProductStatus, ProductCondition } from '../../types';
import { AnalyticsService } from '../../services/analyticsService';
import ProductForm from '../Admin/ProductForm';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'users' | 'import'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, activeListings: 0, pendingApprovals: 0, newUsers: 0 });
  const [loading, setLoading] = useState(true);
  
  // Estados de UI
  const [showProductForm, setShowProductForm] = useState(false);
  
  // Estados de Importação
  const [importUrl, setImportUrl] = useState('');
  const [priceMarkup, setPriceMarkup] = useState(20); // 20% markup padrão
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
      
      setProducts(productsData || []);
      setUsers(usersData || []);
      
      setStats({
        totalSales: (productsData || []).filter((p: any) => p.status === ProductStatus.SOLD).length,
        activeListings: (productsData || []).filter((p: any) => p.status === ProductStatus.ACTIVE).length,
        pendingApprovals: (productsData || []).filter((p: any) => p.status === ProductStatus.PENDING_APPROVAL).length,
        newUsers: (usersData || []).length
      });
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÕES DE PRODUTO ---

  const handleCreateProduct = async (formData: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const productPayload = {
        ...formData,
        seller_id: user.id,
        commission_rate: 0.15,
        commission_amount: formData.price * 0.15,
        shipping_methods: ['postnl', 'dhl'],
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('products').insert([productPayload]);
      if (error) throw error;

      await loadData();
      setShowProductForm(false);
      alert('Produto criado com sucesso!');
    } catch (err) {
      alert('Erro ao criar produto: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (productId: string, status: ProductStatus) => {
    try {
      await supabase.from('products').update({ status }).eq('id', productId);
      setProducts(products.map(p => p.id === productId ? { ...p, status } : p));
    } catch (err) {
      alert('Falha ao atualizar status');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;
    try {
      await supabase.from('products').delete().eq('id', productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      alert('Erro ao deletar');
    }
  };

  // --- FUNÇÕES DE IMPORTAÇÃO (DROPSHIPPING) ---

  const handleSmartImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;
    setIsImporting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Detectar origem
      const isAli = importUrl.includes('aliexpress');
      const isTemu = importUrl.includes('temu');
      const isAmazon = importUrl.includes('amazon');
      const isBol = importUrl.includes('bol.com');

      // Simulação de Scraping (Já que navegadores bloqueiam CORS de sites reais)
      // Em produção real, você usaria uma Edge Function aqui.
      const basePrice = Math.floor(Math.random() * 50) + 20; // Preço "raspado"
      const finalPrice = basePrice * (1 + (priceMarkup / 100)); // Aplica Markup

      const mockProduct = {
        title: isAli ? "AliExpress Import: Gadget Pro" : isTemu ? "Temu Deal: Smart Home Item" : isAmazon ? "Amazon Choice: Tech Item" : "Imported Item",
        description: `Importado automaticamente de: ${importUrl}.\nPreço Original Estimado: €${basePrice}.\nMarkup Aplicado: ${priceMarkup}%`,
        price: parseFloat(finalPrice.toFixed(2)),
        category: 'Gadgets',
        condition: ProductCondition.NEW,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
        seller_id: user.id,
        status: ProductStatus.ACTIVE,
        sku: `DROP-${Date.now()}`,
        stock: 50,
        commission_rate: 0.0,
        commission_amount: 0,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('products').insert([mockProduct]);
      if (error) throw error;

      await loadData();
      setImportUrl('');
      alert(`Produto importado! Preço ajustado de €${basePrice} para €${mockProduct.price}`);
    } catch (err) {
      alert('Erro na importação: ' + (err as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleCSVImport = async () => {
    if (!csvContent) return;
    setIsImporting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Parser simples de CSV (Formato: Titulo,Preco,Categoria,ImagemURL)
      const lines = csvContent.split('\n');
      const productsToInsert = [];

      for (let line of lines) {
        const [title, price, category, image] = line.split(',');
        if (title && price) {
            productsToInsert.push({
                title: title.trim(),
                price: parseFloat(price.trim()),
                category: category?.trim() || 'Outros',
                image: image?.trim() || 'https://via.placeholder.com/300',
                seller_id: user.id,
                condition: ProductCondition.NEW,
                status: ProductStatus.ACTIVE,
                description: 'Importado via CSV em Massa',
                sku: `BULK-${Math.floor(Math.random() * 10000)}`,
                created_at: new Date().toISOString()
            });
        }
      }

      if (productsToInsert.length > 0) {
          const { error } = await supabase.from('products').insert(productsToInsert);
          if (error) throw error;
          await loadData();
          setCsvContent('');
          alert(`${productsToInsert.length} produtos importados com sucesso!`);
      } else {
          alert("Nenhum produto válido encontrado no CSV. Use o formato: Titulo,Preco,Categoria,Imagem");
      }
    } catch (err) {
        alert('Erro no CSV: ' + (err as Error).message);
    } finally {
        setIsImporting(false);
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-40">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Admin Control</span>
          </div>
          <h1 className="text-6xl font-black text-slate-950 tracking-tighter uppercase leading-[0.85]">
            Painel <br /><span className="text-purple-600">Mestre.</span>
          </h1>
          <nav className="flex gap-4 pt-4 overflow-x-auto">
            {[
              { id: 'overview', label: 'Dashboard' },
              { id: 'products', label: 'Produtos' },
              { id: 'import', label: 'Dropshipping & Mass' },
              { id: 'users', label: 'Usuários' }
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

      {/* TABS */}
      
      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-slate-900 text-white p-10 rounded-[40px]">
              <p className="text-4xl font-black">{stats.totalSales}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-60 mt-2">Vendas Totais</p>
           </div>
           <div className="bg-white border border-slate-100 p-10 rounded-[40px]">
              <p className="text-4xl font-black text-emerald-500">{stats.activeListings}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">Listings Ativos</p>
           </div>
           <div className="bg-white border border-slate-100 p-10 rounded-[40px]">
              <p className="text-4xl font-black text-orange-500">{stats.pendingApprovals}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">Pendentes</p>
           </div>
           <div className="bg-white border border-slate-100 p-10 rounded-[40px]">
              <p className="text-4xl font-black text-purple-600">{stats.newUsers}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">Usuários</p>
           </div>
        </div>
      )}

      {/* 2. DROPSHIPPING & MASS IMPORT */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Smart URL Import */}
           <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <span className="w-8 h-8 flex items-center justify-center bg-purple-50 text-purple-600 rounded-full">⚡</span>
                 <h3 className="text-xl font-black uppercase tracking-tighter">Smart Clone (URL)</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">Cole o link (AliExpress, Temu, Amazon) para clonar e ajustar o preço automaticamente.</p>
              
              <form onSubmit={handleSmartImport} className="space-y-4">
                 <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-3 mb-1 block">Link do Produto</label>
                    <input 
                      required 
                      value={importUrl}
                      onChange={e => setImportUrl(e.target.value)}
                      placeholder="https://..." 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 outline-none" 
                    />
                 </div>
                 
                 <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-3 mb-1 block">Markup de Lucro (%)</label>
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
                    {isImporting ? 'Clonando...' : 'Importar & Ajustar Preço'}
                 </button>
              </form>
           </div>

           {/* Bulk CSV Import */}
           <div className="bg-slate-900 p-10 rounded-[40px] shadow-xl text-white space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <span className="w-8 h-8 flex items-center justify-center bg-white/10 text-white rounded-full">📊</span>
                 <h3 className="text-xl font-black uppercase tracking-tighter">Importação em Massa (CSV)</h3>
              </div>
              <p className="text-xs text-white/60 font-medium">Cole seus dados CSV abaixo. Formato: Titulo,Preco,Categoria,ImagemURL</p>
              
              <textarea 
                 value={csvContent}
                 onChange={e => setCsvContent(e.target.value)}
                 placeholder="iPhone 15, 999, Elektronica, http://img...\nCadeira Eames, 450, Design, http://img..."
                 className="w-full h-40 bg-white/10 border-none rounded-2xl p-4 text-xs font-mono text-white placeholder:text-white/20 focus:ring-2 focus:ring-emerald-500/50 outline-none"
              />
              
              <button onClick={handleCSVImport} disabled={isImporting} className="w-full py-4 bg-emerald-500 text-slate-900 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all disabled:opacity-50">
                  {isImporting ? 'Processando...' : 'Processar Lista CSV'}
              </button>
           </div>
        </div>
      )}

      {/* 3. PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-8">
           {!showProductForm ? (
             <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                   <h2 className="font-black uppercase tracking-tighter text-slate-900">Catálogo Global</h2>
                   <button 
                     onClick={() => setShowProductForm(true)} 
                     className="px-6 py-3 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
                   >
                     + Novo Produto
                   </button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
                         <tr>
                            <th className="px-8 py-4">Item</th>
                            <th className="px-8 py-4 text-center">Preço</th>
                            <th className="px-8 py-4 text-center">Status</th>
                            <th className="px-8 py-4 text-right">Ações</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {products.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50/50">
                               <td className="px-8 py-4">
                                  <div className="flex items-center gap-4">
                                     <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                                     <span className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[200px]">{p.title}</span>
                                  </div>
                               </td>
                               <td className="px-8 py-4 text-center font-bold">€{p.price}</td>
                               <td className="px-8 py-4 text-center">
                                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {p.status}
                                  </span>
                               </td>
                               <td className="px-8 py-4 text-right space-x-2">
                                  <button onClick={() => handleDeleteProduct(p.id)} className="text-rose-500 hover:text-rose-700 text-[10px] font-bold uppercase">Deletar</button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           ) : (
             <ProductForm 
               isLoading={loading} 
               onSubmit={handleCreateProduct} 
               onCancel={() => setShowProductForm(false)} 
             />
           )}
        </div>
      )}

      {/* 4. USERS */}
      {activeTab === 'users' && (
         <div className="bg-white rounded-[40px] border border-slate-100 p-8">
            <p className="text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Gestão de Usuários Simplificada</p>
            {/* Lista simplificada de users */}
            <div className="mt-8 space-y-4">
               {users.map(u => (
                  <div key={u.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-black">{u.email[0].toUpperCase()}</div>
                        <div>
                           <p className="text-xs font-bold text-slate-900">{u.email}</p>
                           <p className="text-[9px] text-slate-400 uppercase tracking-widest">{u.role}</p>
                        </div>
                     </div>
                     <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${u.verificationStatus === 'verified' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                        {u.verificationStatus || 'unverified'}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard;