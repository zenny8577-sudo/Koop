// ATUALIZAÇÃO DO TIPO PRODUCT
export interface Product {
  // ... campos existentes
  sku: string;
  barcode: string;
  weight: number;
  dimensions: string;
  originCountry: string; // Código ISO (ex: 'NL', 'CN')
  estimatedDelivery: string; // '3-5 dias úteis'
  shippingMethods: string[];
  warehouseLocation: string; // Código do armazém
  supplierId?: string; // ID do revendedor
  is3DModel: boolean;
  modelGLB?: string; // URL do modelo 3D
}