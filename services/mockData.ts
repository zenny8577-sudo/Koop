
import { Product, Transaction, ProductStatus, ProductCondition, UserRole, User, Review } from '../types';
import { ProductVerificationService } from './verificationService';

export const currentUser: User = {
  id: 'user_123',
  email: 'seller@koop.nl',
  role: UserRole.SELLER,
  stripeAccountId: 'acct_123456789'
};

const categories = ['Elektronica', 'Design', 'Fietsen', 'Antiek', 'Gadgets'];
const conditions = [ProductCondition.NEW, ProductCondition.LIKE_NEW, ProductCondition.GOOD, ProductCondition.FAIR];
const electronicsTitles = ['iPhone 15 Pro', 'MacBook Air M3', 'Sony WH-1000XM5', 'iPad Pro 12.9', 'DJI Mavic 3', 'Samsung S24 Ultra', 'Sonos Era 300', 'Apple Watch Ultra 2', 'Nintendo Switch OLED', 'GoPro Hero 12'];
const designTitles = ['Eames Chair', 'Herman Miller Aeron', 'Kartell Bourgie Lamp', 'Hay Magis Stool', 'Vitrine Cabinet', 'Vintage Berber Rug'];
const images = [
  'https://images.unsplash.com/photo-1517336714467-d13a863b17e9?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
  'https://images.timeout.com/images/105315082/750/422/image.jpg',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800'
];

export const generateMockProducts = (count: number): Product[] => {
  const products: Product[] = [];
  for (let i = 1; i <= count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const titlePool = category === 'Elektronica' ? electronicsTitles : designTitles;
    const title = `${titlePool[Math.floor(Math.random() * titlePool.length)]} #${i}`;
    const price = Math.floor(Math.random() * 2000) + 50;
    
    const product: Product = {
      id: `p-${i}`,
      sellerId: i % 5 === 0 ? 'user_123' : `user_${i}`,
      title,
      description: `Premium quality item in ${condition} condition. Full check performed by our Dutch experts. Ready for shipping. This is a highly sought after item from a reliable source.`,
      price,
      condition,
      status: i > 95 ? ProductStatus.SOLD : ProductStatus.ACTIVE,
      category,
      image: images[i % images.length],
      commissionRate: price > 1000 ? 0.08 : 0.15,
      commissionAmount: price * (price > 1000 ? 0.08 : 0.15),
      sku: `KOOP-TECH-${1000 + i}`,
      barcode: `87123456${1000 + i}`,
      weight: Math.random() * 5,
      size: 'Standard',
      shippingMethods: ['postnl', 'dhl'],
      internalNote: 'Checked and verified'
    };

    // Pre-verify some products to show the badge
    if (i % 3 === 0) {
      product.verification = ProductVerificationService.verify(product);
    }

    products.push(product);
  }
  return products;
};

export const mockProducts: Product[] = generateMockProducts(100);
export const mockTransactions: Transaction[] = [];
export const mockReviews: Review[] = [];
