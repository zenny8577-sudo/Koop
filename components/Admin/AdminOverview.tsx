import React from 'react';
import { Product, User, ProductStatus } from '../../types';

interface AdminOverviewProps {
  products: Product[];
  users: User[];
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ products, users }) => {
  const stats = {
    totalSales: products.filter(p => p.status === ProductStatus.SOLD).length,
    activeListings: products.filter(p => p.status === ProductStatus.ACTIVE).length,
    pendingApprovals: products.filter(p => p.status === ProductStatus.PENDING_APPROVAL).length,
    newUsers: users.length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
      <div className="bg-slate-900 text-white p-10 rounded-[40px]">
        <p className="text-4xl font-black">{stats.totalSales}</p>
        <p className="text-[10px] uppercase tracking-widest opacity-60 mt-2">Totale Verkopen</p>
      </div>
      <div className="bg-white border border-slate-100 p-10 rounded-[40px]">
        <p className="text-4xl font-black text-emerald-500">{stats.activeListings}</p>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">Actieve Advertenties</p>
      </div>
      <div className="bg-white border border-slate-100 p-10 rounded-[40px]">
        <p className="text-4xl font-black text-orange-500">{stats.pendingApprovals}</p>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">In Behandeling</p>
      </div>
      <div className="bg-white border border-slate-100 p-10 rounded-[40px]">
        <p className="text-4xl font-black text-purple-600">{stats.newUsers}</p>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">Gebruikers</p>
      </div>
    </div>
  );
};

export default AdminOverview;