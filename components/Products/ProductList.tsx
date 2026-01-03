const ProductList: React.FC = ({ products }) => {
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
    <table className="w-full">
      <thead>
        <tr>
          <th>
            <input 
              type="checkbox" 
              checked={selectedAll}
              onChange={toggleSelectAll}
            />
          </th>
          {/* Outras colunas */}
        </tr>
      </thead>
      <tbody>
        {products.map(product => (
          <tr key={product.id}>
            <td>
              <input 
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={() => toggleProductSelection(product.id)}
              />
            </td>
            {/* Outras células */}
          </tr>
        ))}
      </tbody>
    </table>
  );
};