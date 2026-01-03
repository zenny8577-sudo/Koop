import React, { useState } from 'react';
import { ExternalImportService } from '../../services/externalImportService';

const AdvancedImport: React.FC = () => {
  const [importSource, setImportSource] = useState<'excel' | 'link' | 'temu' | 'aliexpress'>('excel');
  const [importData, setImportData] = useState<any>(null);

  const handleImport = async () => {
    try {
      switch(importSource) {
        case 'excel':
          // Lógica de importação Excel
          break;
        case 'link':
          // Lógica para importar por link
          break;
        case 'temu':
          await ExternalImportService.importFromTemu(importData);
          break;
        case 'aliexpress':
          await ExternalImportService.importFromAliExpress(importData);
          break;
      }
      alert('Import successful!');
    } catch (error) {
      alert('Import failed: ' + error.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Geavanceerd Importeren</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seletor de fonte */}
        <div>
          <label>Bron:</label>
          <select 
            value={importSource}
            onChange={(e) => setImportSource(e.target.value as any)}
            className="w-full p-2 border rounded"
          >
            <option value="excel">Excel/CSV</option>
            <option value="link">Productlink</option>
            <option value="temu">Temu</option>
            <option value="aliexpress">AliExpress</option>
            <option value="prolo">Prolo</option>
            <option value="spoket">Spoket</option>
          </select>
        </div>

        {/* Campo dinâmico baseado na seleção */}
        {importSource === 'excel' && (
          <input type="file" onChange={(e) => setImportData(e.target.files?.[0])} />
        )}
        
        {importSource === 'link' && (
          <input 
            type="text" 
            placeholder="Plak productlink hier" 
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}

        {/* Configurações de preço */}
        <div className="md:col-span-2">
          <label>Prijsaanpassing:</label>
          <div className="flex gap-4">
            <select className="p-2 border rounded">
              <option>Vaste toeslag</option>
              <option>Percentage verhogen</option>
              <option>Handmatig</option>
            </select>
            <input 
              type="number" 
              placeholder="Waarde" 
              className="p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={handleImport}
        className="mt-4 px-6 py-2 bg-[#FF4F00] text-white rounded hover:bg-[#E04600]"
      >
        Import Starten
      </button>
    </div>
  );
};