import { Product, ProductStatus, ProductCondition, UserRole, User, Transaction, Review } from '../types';

export const currentUser: User = {
  id: 'user_123',
  email: 'seller@koop.nl',
  role: UserRole.SELLER,
  stripeAccountId: 'acct_123456789'
};

export const generateMockProducts = (count: number): Product[] => {
  // Produtos realistas fixos para garantir que a loja pareça bonita
  const fixedProducts: Product[] = [
    {
      id: 'p-iphone-15',
      sellerId: 'user_123',
      title: 'iPhone 15 Pro Max - 256GB Titanium',
      description: 'In absolute nieuwstaat. Batterijconditie 100%. Inclusief originele doos en ongebruikte kabel. Geverifieerd door Koop experts.',
      price: 1150,
      condition: ProductCondition.LIKE_NEW,
      status: ProductStatus.ACTIVE,
      category: 'Elektronica',
      image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
      commissionRate: 0.12,
      commissionAmount: 138,
      sku: 'APL-15PM-TI',
      barcode: '194253000000',
      weight: 0.22,
      shippingMethods: ['postnl', 'dhl'],
      is3DModel: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'p-eames-chair',
      sellerId: 'user_456',
      title: 'Herman Miller Eames Lounge Chair',
      description: 'Originele Vitra uitvoering. Walnoot hout met zwart premium leer. Een tijdloze klassieker in uitstekende vintage staat.',
      price: 4800,
      condition: ProductCondition.GOOD,
      status: ProductStatus.ACTIVE,
      category: 'Design',
      image: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&q=80&w=800',
      commissionRate: 0.08,
      commissionAmount: 384,
      sku: 'HM-EAMES-01',
      barcode: '',
      weight: 30,
      shippingMethods: ['dhl'],
      is3DModel: false,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'p-vanmoof',
      sellerId: 'user_789',
      title: 'VanMoof S3 - Dark',
      description: 'Perfect werkende S3. Firmware geupdate, inclusief Find My tracking. Lichte gebruikssporen op het frame, technisch 100%.',
      price: 1450,
      condition: ProductCondition.GOOD,
      status: ProductStatus.ACTIVE,
      category: 'Fietsen',
      image: 'https://images.unsplash.com/photo-1534149693998-0c36b442146f?auto=format&fit=crop&q=80&w=800',
      commissionRate: 0.12,
      commissionAmount: 174,
      sku: 'VM-S3-BLK',
      barcode: '',
      weight: 19,
      shippingMethods: ['postnl'],
      is3DModel: false,
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'p-rolex',
      sellerId: 'user_123',
      title: 'Rolex Submariner Date',
      description: 'Model 16610. Jaar 2008. Full set met doos en papieren. Recent geserviced. Geverifieerd op echtheid.',
      price: 9200,
      condition: ProductCondition.LIKE_NEW,
      status: ProductStatus.ACTIVE,
      category: 'Antiek',
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800',
      commissionRate: 0.08,
      commissionAmount: 736,
      sku: 'RLX-SUB-08',
      barcode: '',
      weight: 0.5,
      shippingMethods: ['fedex'],
      is3DModel: false,
      createdAt: new Date(Date.now() - 250000000).toISOString()
    },
    {
      id: 'p-macbook',
      sellerId: 'user_999',
      title: 'MacBook Pro 14" M3 Max',
      description: 'Space Black, 1TB SSD, 36GB RAM. Gesealde doos, nooit geopend. Factuur aanwezig.',
      price: 3100,
      condition: ProductCondition.NEW,
      status: ProductStatus.PENDING_APPROVAL,
      category: 'Elektronica',
      image: 'https://images.unsplash.com/photo-1517336714467-d13a863b17e9?auto=format&fit=crop&q=80&w=800',
      commissionRate: 0.12,
      commissionAmount: 372,
      sku: 'APL-MBP-M3',
      barcode: '',
      weight: 1.6,
      shippingMethods: ['postnl'],
      is3DModel: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'p-lamp',
      sellerId: 'user_456',
      title: 'Flos Arco Vloerlamp',
      description: 'Iconisch design. Marmeren voet is onbeschadigd. Boog is perfect verstelbaar.',
      price: 1800,
      condition: ProductCondition.GOOD,
      status: ProductStatus.ACTIVE,
      category: 'Design',
      image: 'https://images.unsplash.com/photo-1513506003011-38f45e86c437?auto=format&fit=crop&q=80&w=800',
      commissionRate: 0.12,
      commissionAmount: 216,
      sku: 'FLS-ARCO',
      barcode: '',
      weight: 65,
      shippingMethods: ['dhl'],
      is3DModel: false,
      createdAt: new Date().toISOString()
    }
  ];

  return fixedProducts;
};

export const mockProducts: Product[] = generateMockProducts(6);
export const mockTransactions: Transaction[] = [];
export const mockReviews: Review[] = [];