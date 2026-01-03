import React, { useState } from 'react';
import { Product, ProductStatus } from '../../types';

interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
    setSelectedAll(!selectedAll);
  };

  const toggleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Product List</h2>
        <div className="flex gap-4">
          <button 
            onClick={toggleSelectAll} 
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium"
          >
            {selectedAll ? 'Deselect All' : 'Select All'}
          </button>
          <button className="px-4 py-2 bg-[#FF4F00] text-white rounded-lg text-sm font-medium">
            Add New Product
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  checked={selectedAll} 
                  onChange={toggleSelectAll} 
                  className="w-4 h-4 text-[#FF4F00] border-slate-300 rounded focus:ring-[#FF4F00]" 
                />
              </th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.slice(0, 10).map(product => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    checked={selectedProducts.includes(product.id)} 
                    onChange={() => toggleProductSelection(product.id)} 
                    className="w-4 h-4 text-[#FF4F00] border-slate-300 rounded focus:ring-[#FF4F00]" 
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <img src={product.image} alt={product.title} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium text-slate-900">{product.title}</p>
                      <p className="text-sm text-slate-500">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="font-bold text-slate-900">€{product.price.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Commission: €{product.commissionAmount.toFixed(2)}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.status === ProductStatus.ACTIVE 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : product.status === ProductStatus.SOLD 
                        ? 'bg-slate-100 text-slate-600' 
                        : 'bg-orange-100 text-orange-600'
                  }`}>
                    {product.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button className="text-slate-400 hover:text-slate-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="text-slate-400 hover:text-slate-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Showing 10 of {products.length} products</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">Previous</button>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">Next</button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;