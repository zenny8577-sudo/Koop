import React, { useState } from 'react';

// Initial structure matching the ShopView mapping
const INITIAL_CATEGORIES: Record<string, string[]> = {
  'Elektronica': ['Smartphones', 'Laptops', 'Audio', 'Camera', 'Gaming', 'TV & Home Cinema'],
  'Design': ['Stoelen', 'Tafels', 'Verlichting', 'Kasten', 'Decoratie', 'Banken'],
  'Fietsen': ['Stadsfietsen', 'E-bikes', 'Racefietsen', 'Bakfietsen', 'Kinderfietsen'],
  'Vintage Mode': ['Tassen', 'Kleding', 'Accessoires', 'Schoenen', 'Horloges', 'Sieraden'],
  'Kunst & Antiek': ['Schilderijen', 'Sculpturen', 'Keramiek', 'Klokken', 'Glaswerk'],
  'Gadgets': ['Drones', 'Smart Home', 'Wearables', 'Keuken', '3D Printers']
};

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Record<string, string[]>>(INITIAL_CATEGORIES);
  const [selectedParent, setSelectedParent] = useState<string>('Elektronica');
  const [newParent, setNewParent] = useState('');
  const [newSub, setNewSub] = useState('');

  // Parent Category Actions
  const handleAddParent = () => {
    if (newParent && !categories[newParent]) {
      setCategories({ ...categories, [newParent]: [] });
      setSelectedParent(newParent);
      setNewParent('');
    }
  };

  const handleRemoveParent = (parent: string) => {
    if (confirm(`Verwijder hoofdcategorie "${parent}" en alle subcategorieën?`)) {
      const newCats = { ...categories };
      delete newCats[parent];
      setCategories(newCats);
      if (selectedParent === parent) {
        setSelectedParent(Object.keys(newCats)[0] || '');
      }
    }
  };

  // Subcategory Actions
  const handleAddSub = () => {
    if (newSub && selectedParent) {
      if (!categories[selectedParent].includes(newSub)) {
        setCategories({
          ...categories,
          [selectedParent]: [...categories[selectedParent], newSub]
        });
        setNewSub('');
      }
    }
  };

  const handleRemoveSub = (sub: string) => {
    if (selectedParent) {
      setCategories({
        ...categories,
        [selectedParent]: categories[selectedParent].filter(s => s !== sub)
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn h-[600px]">
      {/* Parent Categories Column */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 flex flex-col h-full shadow-sm">
        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 text-slate-900">Hoofdcategorieën</h3>
        
        <div className="flex gap-3 mb-6">
          <input 
            value={newParent} 
            onChange={e => setNewParent(e.target.value)}
            placeholder="Nieuwe Hoofdcategorie" 
            className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <button 
            onClick={handleAddParent} 
            className="bg-slate-900 text-white w-14 rounded-2xl font-black text-xl hover:bg-purple-600 transition-colors shadow-lg"
          >
            +
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {Object.keys(categories).map(cat => (
            <div 
              key={cat} 
              onClick={() => setSelectedParent(cat)}
              className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                selectedParent === cat 
                  ? 'bg-purple-50 border-purple-500/20 shadow-md' 
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${selectedParent === cat ? 'bg-purple-500' : 'bg-slate-300'}`} />
                <span className={`text-sm font-black uppercase tracking-tight ${selectedParent === cat ? 'text-purple-900' : 'text-slate-600'}`}>{cat}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleRemoveParent(cat); }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subcategories Column */}
      <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-200 flex flex-col h-full relative overflow-hidden">
        {selectedParent ? (
          <>
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subcategorieën van</span>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-purple-600">{selectedParent}</h3>
            </div>

            <div className="flex gap-3 mb-6">
              <input 
                value={newSub} 
                onChange={e => setNewSub(e.target.value)}
                placeholder={`Nieuwe subcategorie in ${selectedParent}`} 
                className="flex-1 bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none shadow-sm focus:ring-2 focus:ring-purple-500/20"
              />
              <button 
                onClick={handleAddSub} 
                className="bg-purple-600 text-white w-14 rounded-2xl font-black text-xl hover:bg-purple-700 transition-colors shadow-lg"
              >
                +
              </button>
            </div>

            <div className="flex-1 overflow-y-auto content-start grid grid-cols-1 gap-3 pr-2 custom-scrollbar">
              {categories[selectedParent].length > 0 ? (
                categories[selectedParent].map(sub => (
                  <div key={sub} className="group bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                    <span className="text-sm font-bold text-slate-700">{sub}</span>
                    <button 
                      onClick={() => handleRemoveSub(sub)}
                      className="text-slate-300 hover:text-rose-500 transition-colors px-2 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 opacity-60">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  <p className="text-xs font-black uppercase tracking-widest">Leeg</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <p className="text-sm font-medium">Selecteer eerst een hoofdcategorie</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;