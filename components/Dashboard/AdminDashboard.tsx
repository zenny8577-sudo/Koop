// Adicionar nova aba na navegação
const [activeView, setActiveView] = useState<'inventory' | 'queue' | 'verifications' | 'analytics' | 'categories'>('inventory');

// Adicionar na lista de tabs
{ id: 'categories', label: 'Categorieën' }

// Adicionar conteúdo da view de categorias
{activeView === 'categories' && (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-black">Categoriebeheer</h3>
      <button 
        onClick={() => setShowCategoryModal(true)}
        className="px-4 py-2 bg-[#FF4F00] text-white rounded-lg"
      >
        Nieuwe Categorie +
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {db.getCategories().map(category => (
        <div key={category} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <span>{category}</span>
            <div className="flex gap-2">
              <button onClick={() => editCategory(category)}>✏️</button>
              <button onClick={() => deleteCategory(category)}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}