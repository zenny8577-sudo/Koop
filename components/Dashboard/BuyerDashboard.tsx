
import React from 'react';
import MetricCard from './MetricCard';
import { ICONS } from '../../constants';

const BuyerDashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mijn Bestellingen</h1>
          <p className="text-slate-500">Bekijk je recente aankopen en status van verzending.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            {ICONS.CART}
          </div>
          <div>
            <p className="text-slate-500 text-sm">Lopende bestellingen</p>
            <p className="text-3xl font-black text-slate-900">2</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
            {ICONS.TAG}
          </div>
          <div>
            <p className="text-slate-500 text-sm">Favoriete items</p>
            <p className="text-3xl font-black text-slate-900">12</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Bestelgeschiedenis</h2>
        </div>
        <div className="p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 118 0m-4 7v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2m4 6V7a4 4 0 018 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <p className="text-slate-500">Je hebt nog geen aankopen gedaan. <span className="text-[#FF4F00] font-bold cursor-pointer">Begin met shoppen!</span></p>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
