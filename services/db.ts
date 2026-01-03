import { Product, Transaction, ProductStatus, ProductCondition, UserRole, User, Review, VerificationResult, VerificationCheck } from '../types';
import { ProductVerificationService } from './verificationService';

class DatabaseService {
  private products: Product[];
  private users: User[];
  private transactions: Transaction[];
  private reviews: Review[];

  constructor() {
    this.products = this.generateMockProducts(100);
    this.users = this.generateMockUsers();
    this.transactions = [];
    this.reviews = [];
  }

  private generateMockProducts(count: number): Product[] {
    const products: Product[] = [];
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
        dimensions: 'Standard',
        originCountry: 'NL',
        estimatedDelivery: '2-4 days',
        shippingMethods: ['postnl', 'dhl'],
        warehouseLocation: 'Amsterdam',
        is3DModel: false
      };

      // Pre-verify some products to show the badge
      if (i % 3 === 0) {
        product.verification = ProductVerificationService.verify(product);
      }

      products.push(product);
    }
    return products;
  }

  private generateMockUsers(): User[] {
    return [
      {
        id: 'user_123',
        email: 'seller@koop.nl',
        role: UserRole.SELLER,
        firstName: 'Sjors',
        lastName: 'de Groot',
        phone: '+31 6 12345678',
        verificationStatus: 'verified'
      },
      {
        id: 'admin_breno',
        email: 'brenodiogo27@icloud.com',
        role: UserRole.ADMIN,
        firstName: 'Breno',
        lastName: 'Diogo',
        phone: '+31 6 87654321',
        verificationStatus: 'verified'
      },
      {
        id: 'buyer_1',
        email: 'buyer@koop.nl',
        role: UserRole.BUYER,
        firstName: 'Anna',
        lastName: 'van Dijk',
        phone: '+31 6 23456789',
        verificationStatus: 'unverified'
      }
    ];
  }

  getProducts(page: number, limit: number, filters: any): { data: Product[], total: number } {
    let filtered = [...this.products];

    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.sku.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter(p =>
        p.price >= (filters.minPrice || 0) &&
        p.price <= (filters.maxPrice || Infinity)
      );
    }

    if (filters.sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      data: paginated,
      total: filtered.length
    };
  }

  getProduct(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getCategories(): string[] {
    return [...new Set(this.products.map(p => p.category))];
  }

  createProduct(product: Omit<Product, 'id' | 'status'>): Product {
    const newProduct: Product = {
      ...product,
      id: `p-${Date.now()}`,
      status: ProductStatus.PENDING_APPROVAL,
      createdAt: new Date().toISOString()
    };
    this.products.push(newProduct);
    return newProduct;
  }

  updateProductStatus(productId: string, status: ProductStatus) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.status = status;
    }
  }

  updateUserVerification(userId: string, status: 'verified' | 'pending' | 'rejected') {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.verificationStatus = status;
    }
  }

  getReviews(productId: string): Review[] {
    return this.reviews.filter(r => r.productId === productId);
  }

  createTransaction(productId: string, user: User) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const transaction = {
      id: `t-${Date.now()}`,
      productId,
      userId: user.id,
      amount: product.price,
      createdAt: new Date().toISOString()
    };

    this.transactions.push(transaction);
    return transaction;
  }

  toggleWishlist(userId: string, productId: string): User | null {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;

    if (!user.wishlist) user.wishlist = [];

    if (user.wishlist.includes(productId)) {
      user.wishlist = user.wishlist.filter(id => id !== productId);
    } else {
      user.wishlist.push(productId);
    }

    return user;
  }

  getAllProductsAdmin(): Product[] {
    return this.products;
  }

  getAllUsers(): User[] {
    return this.users;
  }

  syncWooCommerce(count: number): number {
    // Simulate WooCommerce sync
    for (let i = 0; i < count; i++) {
      this.products.push({
        id: `wc-${Date.now()}-${i}`,
        sellerId: 'user_123',
        title: `WooCommerce Product ${i + 1}`,
        description: 'Imported from WooCommerce store',
        price: Math.floor(Math.random() * 1500) + 100,
        condition: ProductCondition.LIKE_NEW,
        status: ProductStatus.PENDING_APPROVAL,
        category: 'Elektronica',
        image: 'https://images.unsplash.com/photo-1517336714467-d13a863b17e9?auto=format&fit=crop&q=80&w=800',
        commissionRate: 0.12,
        commissionAmount: 0,
        sku: `WC-${Date.now()}-${i}`,
        barcode: `WC-${Date.now()}-${i}`,
        weight: 1.5,
        dimensions: 'Standard',
        originCountry: 'NL',
        estimatedDelivery: '2-4 days',
        shippingMethods: ['postnl', 'dhl'],
        warehouseLocation: 'Amsterdam',
        is3DModel: false
      });
    }
    return count;
  }
}

// Export a singleton instance
export const db = new DatabaseService();