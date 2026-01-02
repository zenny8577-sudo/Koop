const StockManagement = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-bold">Localização Física</h4>
        {/* Mapa integrado com localização */}
      </div>
      
      <div>
        <h4 className="font-bold mb-2">Importar via Excel</h4>
        <a href="/templates/product-import-template.xlsx" 
           className="text-blue-500 underline">
          Baixar Modelo
        </a>
        <input type="file" className="mt-2" />
      </div>
    </div>
  );
};