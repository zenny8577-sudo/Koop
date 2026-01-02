const SellerDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold">Minha Loja</h2>
        {/* Seções: */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="border p-4 rounded">
            <h3 className="font-bold">Configurações da Loja</h3>
            {/* Campos: logo, banner, descrição */}
          </div>
          
          <div className="border p-4 rounded">
            <h3 className="font-bold">Estatísticas</h3>
            {/* Gráficos de vendas */}
          </div>
          
          <div className="border p-4 rounded">
            <h3 className="font-bold">Mensagens</h3>
            {/* Sistema de chat */}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold mb-4">Gestão de Produtos</h3>
        {/* Tabela de produtos com ações */}
      </div>
    </div>
  );
};