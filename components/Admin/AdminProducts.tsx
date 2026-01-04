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

  // Helper para verificar se é um UUID válido do Postgres
  const isValidUUID = (id: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(id);
  };

  const mapFormToDb = (formData: any, userId: string) => {
    return {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      subcategory: formData.subcategory || null,
      condition: formData.condition,
      image: formData.image,
      gallery: formData.gallery || [],
      sku: formData.sku,
      status: formData.status || ProductStatus.ACTIVE,
      
      // Campos Críticos
      seller_id: userId, 
      commission_rate: 0.15,
      commission_amount: (parseFloat(formData.price) * 0.15),
      shipping_methods: ['postnl', 'dhl'],
      origin_country: formData.originCountry || 'NL',
      estimated_delivery: formData.estimatedDelivery || '1-3 werkdagen',
      is_3d_model: false,
      updated_at: new Date().toISOString()
    };
  };

  const handleCreateOrUpdateProduct = async (formData: any) => {
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessie verlopen. Log opnieuw in.");

      const productPayload = mapFormToDb(formData, user.id);
      let error;

      if (editingProduct && editingProduct.id && isValidUUID(editingProduct.id)) {
        // UPDATE REAL PRODUCT
        const { error: updateError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);
        error = updateError;
      } else {
        // INSERT NEW PRODUCT (ou Migrar Mock para Real)
        const { error: insertError } = await supabase
          .from('products')
          .insert([{
            ...productPayload,
            created_at: new Date().toISOString()
          }]);
        error = insertError;
      }

      if (error) throw error;

      setShowProductForm(false);
      setEditingProduct(null);
      onRefresh(); 

    } catch (err) {
      console.error("Save Error:", err);
      if ((err as any).message?.includes('invalid input syntax for type uuid')) {
         alert('Systeemfout: Probeer het product opnieuw aan te maken in plaats van te bewerken.');
      } else {
         alert('Fout bij opslaan: ' + (err as Error).message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Weet u zeker dat u dit product definitief wilt verwijderen?')) return;
    
    if (!isValidUUID(productId)) {
       // Apenas atualiza a UI removendo visualmente se for demo
       onRefresh(); 
       return;
    }

    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);

      if (error) {
        if (error.code === '23503') {
           throw new Error("Dit product zit in een bestelling en kan niet worden verwijderd. Zet de status op 'Gearchiveerd'.");
        }
        throw error;
      }

      onRefresh();
    } catch (err) {
      console.error("Delete Error:", err);
      alert('Kan niet verwijderen: ' + (err as Error).message);
    }
  };

  const handleStatusChange = async (productId: string, newStatus: ProductStatus) => {
    // 1. Se for produto REAL, atualiza status normalmente
    if (isValidUUID(productId)) {
      try {
        const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', productId);
        if (error) throw error;
        onRefresh();
      } catch (e) {
        alert('Update mislukt: ' + (e as Error).message);
      }
      return;
    }

    // 2. Se for DEMO, cria ele no banco com o status novo (Migração Automática)
    const productToMigrate = products.find(p => p.id === productId);
    if (!productToMigrate) return;

    // Feedback visual rápido
    if (!confirm(`Dit demo-item opslaan in de database als ${newStatus}?`)) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          alert("Log in om wijzigingen op te slaan.");
          return;
      }

      const newProductPayload = {
        title: productToMigrate.title,
        description: productToMigrate.description,
        price: productToMigrate.price,
        category: productToMigrate.category,
        condition: productToMigrate.condition,
        image: productToMigrate.image,
        gallery: productToMigrate.gallery || [],
        sku: productToMigrate.sku,
        status: newStatus, // AQUI aplicamos o status do botão (ACTIVE ou REJECTED)
        
        seller_id: user.id, // Assume o admin atual como dono na migração
        commission_rate: 0.15,
        commission_amount: (productToMigrate.price * 0.15),
        shipping_methods: ['postnl'],
        origin_country: 'NL',
        estimated_delivery: '1-3 werkdagen',
        is_3d_model: false,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('products').insert([newProductPayload]);
      if (error) throw error;

      onRefresh();
      // Não precisa de alert de sucesso, a atualização da tabela é o feedback

    } catch (e) {
      alert('Fout bij migreren: ' + (e as Error).message);
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
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                         <img src={p.image} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50'} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[200px]">{p.title}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] text-slate-400 font-mono">{p.sku || p.id.substring(0,8)}</span>
                           {!isValidUUID(p.id) && <span className="text-[8px] bg-slate-100 text-slate-500 px-1 rounded font-bold">DEMO</span>}
                        </div>
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
                          <button onClick={() => handleStatusChange(p.id, ProductStatus.ACTIVE)} className="text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded text-[10px] font-black uppercase">APROVAR</button>
                          <button onClick={() => handleStatusChange(p.id, ProductStatus.REJECTED)} className="text-rose-500 hover:bg-rose-50 px-3 py-1 rounded text-[10px] font-black uppercase">REJEITAR</button>
                        </>
                      )}
                      <button onClick={() => { setEditingProduct(p); setShowProductForm(true); }} className="text-blue-500 hover:text-blue-700 text-[10px] font-bold uppercase p-2">EDITAR</button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-slate-400 hover:text-rose-500 text-[10px] font-bold uppercase p-2 group" title="Verwijderen">
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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