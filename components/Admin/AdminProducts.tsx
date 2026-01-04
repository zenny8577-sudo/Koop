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
    console.log("Iniciando salvamento...", formData);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) throw new Error("Sessie verlopen. Log opnieuw in.");

      // 1. Sanitização e Mapeamento para o Banco (Snake Case)
      // O banco espera: seller_id, commission_rate, origin_country, etc.
      const productPayload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory || null,
        condition: formData.condition,
        image: formData.image,
        gallery: formData.gallery || [],
        sku: formData.sku,
        status: formData.status || ProductStatus.ACTIVE, // Mantém status ou define ativo
        
        // Campos mapeados para snake_case do banco
        seller_id: userId, 
        commission_rate: 0.15,
        commission_amount: (parseFloat(formData.price) * 0.15),
        shipping_methods: ['postnl', 'dhl'],
        origin_country: formData.originCountry || 'NL',
        estimated_delivery: formData.estimatedDelivery || '1-3 werkdagen',
        is_3d_model: false,
        updated_at: new Date().toISOString()
      };

      let error;

      if (editingProduct && editingProduct.id) {
        // UPDATE
        console.log("Atualizando produto:", editingProduct.id);
        const { error: updateError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);
        error = updateError;
      } else {
        // INSERT
        console.log("Criando novo produto");
        const { error: insertError } = await supabase
          .from('products')
          .insert([{
            ...productPayload,
            created_at: new Date().toISOString()
          }]);
        error = insertError;
      }

      if (error) {
        console.error("Supabase Error:", error);
        throw new Error(error.message);
      }

      alert(editingProduct ? 'Product succesvol bijgewerkt!' : 'Product succesvol aangemaakt!');
      setShowProductForm(false);
      setEditingProduct(null);
      onRefresh(); // Recarrega a lista

    } catch (err) {
      console.error("Save Error:", err);
      alert('Fout bij opslaan: ' + (err as Error).message);
    } finally {
      // GARANTE QUE O LOADING PARE
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Weet u zeker dat u dit product definitief wilt verwijderen?')) return;
    
    try {
      console.log("Deletando produto:", productId);
      const { error } = await supabase.from('products').delete().eq('id', productId);

      if (error) throw error;

      onRefresh();
      alert("Product verwijderd.");
    } catch (err) {
      console.error("Delete Error:", err);
      alert('Kan niet verwijderen: ' + (err as Error).message);
    }
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      const { error } = await supabase.from('products').update({ status: ProductStatus.ACTIVE }).eq('id', productId);
      if (error) throw error;
      onRefresh();
    } catch (e) {
      alert('Fout bij goedkeuren: ' + (e as Error).message);
    }
  };

  const handleRejectProduct = async (productId: string) => {
    if (!confirm('Product afwijzen?')) return;
    try {
      const { error } = await supabase.from('products').update({ status: ProductStatus.REJECTED }).eq('id', productId);
      if (error) throw error;
      onRefresh();
    } catch (e) {
      alert('Fout bij afwijzen: ' + (e as Error).message);
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
                      <img src={p.image || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-lg object-cover bg-slate-100" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50?text=Err'} />
                      <div>
                        <span className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[200px]">{p.title}</span>
                        <span className="text-[9px] text-slate-400">{p.id.substring(0,8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center font-bold">€{p.price}</td>
                  <td className="px-8 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : p.status === 'PENDING_APPROVAL' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                      {p.status?.replace('_', ' ') || 'UNKNOWN'}
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
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-slate-400 hover:text-rose-500 text-[10px] font-bold uppercase p-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
  );
};

export default AdminProducts;