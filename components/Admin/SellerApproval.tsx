import React from 'react';
import { User } from '../../types';

interface SellerApprovalProps {
  sellers: User[];
}

const SellerApproval: React.FC<SellerApprovalProps> = ({ sellers }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="text-xl font-bold mb-4">Aprovação de Sellers</h3>
      {sellers.map(seller => (
        <div key={seller.id} className="flex items-center justify-between p-4 border-b">
          <div>
            <p>{seller.companyName}</p>
            <p className="text-sm text-gray-500">{seller.kvkNumber}</p>
          </div>
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Aprovar
          </button>
        </div>
      ))}
    </div>
  );
};

export default SellerApproval;