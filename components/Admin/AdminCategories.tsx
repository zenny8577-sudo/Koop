import React, { useState } from 'react';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<string[]>(['Elektronica', 'Design', 'Fietsen', 'Antiek', 'Gadgets', 'Mode']);
  const [tags, setTags] = useState<string[]>(['Nieuw', 'Vintage', 'Refurbished', 'Sale']);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
      <div className="bg-white p-10 rounded-[40px] border border-slate-100">
        <h3 className="text-xl font-black uppercase tracking-tighter mb-6">Categorieën Beheer</h3>
        <div className="flex gap-4 mb-6">
          <input 
            value={newCategory} 
            onChange={e => setNewCategory(e.target.value)}
            placeholder="Nieuwe Categorie" 
            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none"
          />
          <button onClick={handleAddCategory} className="bg-purple-600 text-white px-6 rounded-xl font-black text-xs uppercase hover:bg-purple-700">+</button>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <div key={cat} className="px-4 py-2 bg-slate-50 rounded-xl flex items-center gap-3">
              <span className="text-xs font-bold text-slate-900">{cat}</span>
              <button onClick={() => handleRemoveCategory(cat)} className="text-rose-400 hover:text-rose-600 font-bold">×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-slate-100">
        <h3 className="text-xl font-black uppercase tracking-tighter mb-6">Tags Beheer</h3>
        <div className="flex flex-wrap gap-3">
          {tags.map(tag => (
            <div key={tag} className="px-4 py-2 bg-purple-50 rounded-xl text-purple-600 text-xs font-black uppercase tracking-widest">
              #{tag}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest">Tags worden automatisch gegenereerd op basis van productfilters.</p>
      </div>
    </div>
  );
};

export default AdminCategories;