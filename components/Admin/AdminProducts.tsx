import React, { useState } from 'react';
import { supabase } from '../../src/integrations/supabase/client';
import { Product, ProductStatus } from '../../types';
import ProductForm from './ProductForm';

interface AdminProductsProps {
  products: Product[];
  loading: boolean;
  onRefresh: () => void;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ products, loading, onRefresh }) => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreateOrUpdateProduct = async (formData: any) => {
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'admin_local';

      // Construir payload com mapeamento correto para snake_case do banco
      const productPayload = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        subcategory: formData.subcategory,
        condition: formData.condition,
        image: formData.image,
        gallery: formData.gallery,
        sku: formData.sku,
        status: ProductStatus.ACTIVE,
        
        // Mapeamento correto para snake_case
        seller_id: userId,
        commission_rate: 0.15,
        commission_amount: formData.price * 0.15,
        shipping_methods: ['postnl', 'dhl'],
        origin_country: formData.originCountry, // Adicionado
        estimated_delivery: formData.estimatedDelivery, // Adicionado
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        // Para update, usamos o ID do produto que estamos editando
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);
          
        if (error) throw error;
        alert('Product bijgewerkt!');
      } else {
        // Para insert, adicionamos created_at
        const { error } = await supabase
          .from('products')
          .insert([{
            ...productPayload,
            created_at: new Date().toISOString()
          }]);
          
        if (error) throw error;
        alert('Product aangemaakt!');
      }

      onRefresh();
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      alert('Actie mislukt: ' + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Weet u zeker dat u dit product wilt verwijderen?')) return;
    try {
      await supabase.from('products').delete().eq('id', productId);
      onRefresh();
    } catch (err) {
      alert('Kan niet verwijderen (Mock data of Database fout)');
      onRefresh(); 
    }
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      await supabase.from('products').update({ status: ProductStatus.ACTIVE }).eq('id', productId);
      onRefresh();
    } catch (e) {
      alert('Fout bij goedkeuren');
    }
  };

  const handleRejectProduct = async (productId: string) => {
    if (!confirm('Product afwijzen?')) return;
    try {
      await supabase.from('products').update({ status: ProductStatus.REJECTED }).eq('id', productId);
      onRefresh();
    } catch (e) {
      alert('Fout bij afwijzen');
    }
  };

  if (showProductForm) {
    return (
      <div className="animate-fadeIn">
        <ProductForm 
          initialData={editingProduct || {}}
          isLoading={actionLoading} 
          onSubmit={handleCreateOrUpdateProduct} 
          onCancel={() => setShowProductForm(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
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
    </div>
  );
};

export default AdminProducts;