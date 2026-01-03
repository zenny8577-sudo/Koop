import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { User, Transaction } from '../../types';
import { ICONS } from '../../constants';
import ProfileSettings from '../Profile/ProfileSettings';
import AddressBook from '../Profile/AddressBook';

interface BuyerDashboardProps {
  user: User;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ user: initialUser }) => {
  const [user, setUser] = useState<User>(db.getUser(initialUser.id));
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    setTransactions(db.getTransactionsByUser(user.id));
  }, [user.id]);

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleOpenReview = (t: Transaction) => {
    setSelectedTransaction(t);
    setRating(5);
    setComment('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    db.addReview({
      productId: selectedTransaction.productId,
      userId: user.id,
      userName: user.firstName || user.email.split('@')[0],
      rating,
      comment
    });

    setShowReviewModal(false);
    setSelectedTransaction(null);
    alert('Bedankt voor je review!');
  };

  return (
    <div className="space-y-16 animate-fadeIn pb-32">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Koper Dashboard</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">
            Mijn <br /> <span className="text-blue-600">Account.</span>
          </h1>
          <nav className="flex gap-10 pt-4">
            {[
              { id: 'orders', label: 'Bestellingen' },
              { id: 'addresses', label: 'Adressen' },
              { id: 'profile', label: 'Profiel Instellingen' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all relative pb-2 group ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
                <div className={`absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-500 ${activeTab === tab.id ? 'w-full' : 'w-0 group-hover:w-4'}`} />
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
           <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
             {(user.firstName || user.email)[0].toUpperCase()}
           </div>
           <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{user.firstName ? `${user.firstName} ${user.lastName}` : user.email}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{user.role} ID: {user.id}</p>
           </div>
        </div>
      </header>

      {activeTab === 'orders' && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex items-center gap-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-[24px] flex items-center justify-center">{ICONS.CART}</div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Totaal besteld</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{transactions.length}</p>
              </div>
            </div>
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex items-center gap-8">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-[24px] flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">Actief</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[60px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter text-slate-950">Bestelgeschiedenis</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{transactions.length} Bestellingen</span>
            </div>

            {transactions.length === 0 ? (
              <div className="py-40 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 118 0m-4 7v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2m4 6V7a4 4 0 018 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Je hebt nog geen aankopen gedaan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="px-12 py-8">Datum</th>
                      <th className="px-12 py-8">Product</th>
                      <th className="px-12 py-8 text-right">Bedrag</th>
                      <th className="px-12 py-8 text-center">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.map(t => {
                      const hasReviewed = db.hasReviewed(user.id, t.productId);
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-12 py-8 text-xs font-bold text-slate-500">{new Date(t.createdAt).toLocaleDateString('nl-NL')}</td>
                          <td className="px-12 py-8"><span className="text-sm font-black text-slate-900 uppercase tracking-tight">{t.productTitle}</span></td>
                          <td className="px-12 py-8 text-right font-black text-slate-900">€ {t.amount.toLocaleString()}</td>
                          <td className="px-12 py-8 text-center">
                            {hasReviewed ? (
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">Reviewed</span>
                            ) : (
                              <button onClick={() => handleOpenReview(t)} className="text-[10px] font-black text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 px-4 py-2 rounded-xl transition-all uppercase tracking-widest">Review Schrijven</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'addresses' && <AddressBook user={user} onUpdate={handleUpdateUser} />}
      {activeTab === 'profile' && <ProfileSettings user={user} onUpdate={handleUpdateUser} />}

      {showReviewModal && selectedTransaction && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" onClick={() => setShowReviewModal(false)} />
          <form onSubmit={handleSubmitReview} className="relative bg-white w-full max-w-xl p-12 rounded-[60px] shadow-3xl space-y-10">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Feedback</span>
              <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase leading-none">Review voor {selectedTransaction.productTitle}</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-4">Waardering (1-5)</label>
                <div className="flex gap-4 px-4">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setRating(s)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${rating >= s ? 'bg-amber-400 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-50 text-slate-300'}`}>
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-4">Je ervaring</label>
                <textarea required placeholder="Wat vond je van het product en de curatie?" className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 text-sm font-bold outline-none h-40 focus:ring-4 focus:ring-blue-500/10 transition-all" value={comment} onChange={e => setComment(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 py-6 bg-slate-50 text-slate-400 font-black rounded-3xl uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all">Annuleren</button>
              <button type="submit" className="flex-1 py-6 bg-slate-950 text-white font-black rounded-3xl uppercase tracking-widest text-[11px] shadow-2xl hover:bg-blue-600 transition-all">Verzenden</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;