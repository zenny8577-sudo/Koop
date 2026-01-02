
import { Product, Transaction, Review, User, ProductStatus, UserRole, ProductCondition, VerificationResult, UserAddress, VerificationStatus } from '../types';
import { mockProducts, mockTransactions, mockReviews, currentUser } from './mockData';
import { ProductVerificationService } from './verificationService';

class DatabaseService {
  private products: Product[] = mockProducts.map(p => ({
    ...p,
    // Garante que cada produto tenha pelo menos 2 imagens na galeria
    gallery: [p.image, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800']
  }));
  private transactions: Transaction[] = [...mockTransactions];
  private reviews: Review[] = [...mockReviews];
  private users: User[] = [
    { 
      ...currentUser, 
      verificationStatus: 'verified',
      wishlist: [],
      addresses: [
        { id: 'addr_1', label: 'Thuis', firstName: 'Sjors', lastName: 'de Groot', email: 'sjors@koop.nl', street: 'Prinsengracht', houseNumber: '456', city: 'Amsterdam', zipCode: '1016 AA', phone: '+31 6 12345678', isDefault: true }
      ]
    }
  ];
  private categories: string[] = ['Elektronica', 'Design', 'Fietsen', 'Antiek', 'Gadgets'];

  getCategories() {
    return this.categories;
  }

  getUser(id: string) {
    return this.users.find(u => u.id === id) || this.users[0];
  }

  updateUser(id: string, updates: Partial<User>) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      return this.users[idx];
    }
    return undefined;
  }

  toggleWishlist(userId: string, productId: string) {
    const user = this.getUser(userId);
    if (!user) return;
    const wishlist = user.wishlist || [];
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    return this.updateUser(userId, { wishlist: newWishlist });
  }

  submitVerification(id: string, docs: string[]) {
    return this.updateUser(id, {
      verificationStatus: 'pending',
      verificationDocs: docs
    });
  }

  getPendingVerifications() {
    return this.users.filter(u => u.verificationStatus === 'pending');
  }

  updateUserVerification(id: string, status: VerificationStatus) {
    return this.updateUser(id, { verificationStatus: status });
  }

  getReviews(productId: string) {
    return this.reviews.filter(r => r.productId === productId);
  }

  addReview(review: Omit<Review, 'id' | 'createdAt'>) {
    const newReview: Review = {
      ...review,
      id: `rev-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    this.reviews.unshift(newReview);
    return newReview;
  }

  hasReviewed(userId: string, productId: string): boolean {
    return this.reviews.some(r => r.userId === userId && r.productId === productId);
  }

  getProducts(page = 1, limit = 100, filters: any = {}) {
    let filtered = [...this.products];
    
    if (!filters.showAllStatus) {
      filtered = filtered.filter(p => p.status === ProductStatus.ACTIVE);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }

    // Sort Logic
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filtered.sort((a, b) => b.id.localeCompare(a.id));
          break;
        default:
          break;
      }
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    
    return {
      data: filtered.slice(start, start + limit),
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  getAllProductsAdmin() {
    return [...this.products];
  }

  approveProduct(id: string) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const product = this.products[idx];
      const verification = ProductVerificationService.verify(product);
      this.products[idx].verification = verification;
      this.products[idx].status = ProductStatus.ACTIVE;
    }
  }

  rejectProduct(id: string) {
    this.deleteProduct(id);
  }

  verifyProductOnly(id: string): VerificationResult | undefined {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const verification = ProductVerificationService.verify(this.products[idx]);
      this.products[idx].verification = verification;
      return verification;
    }
    return undefined;
  }

  deleteProduct(id: string) {
    this.products = this.products.filter(p => p.id !== id);
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...updates };
      return this.products[idx];
    }
  }

  createProduct(product: Omit<Product, 'id'>) {
    const is_admin = product.sellerId?.includes('admin');
    const newProduct: Product = { 
      ...product, 
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      status: is_admin ? ProductStatus.ACTIVE : ProductStatus.PENDING_APPROVAL,
      gallery: [product.image, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'],
      shippingMethods: product.shippingMethods || ['postnl']
    } as Product;

    if (is_admin) {
        newProduct.verification = ProductVerificationService.verify(newProduct);
    }

    this.products.unshift(newProduct);
    return newProduct;
  }

  async syncWooCommerce(count: number) {
    await new Promise(resolve => setTimeout(resolve, 800));
    for (let i = 0; i < count; i++) {
      const price = Math.floor(Math.random() * 1500) + 200;
      this.createProduct({
        sellerId: 'user_123',
        title: `Woo Product ${Math.floor(Math.random() * 1000)}`,
        description: 'Sync product. Verification pending.',
        price,
        condition: ProductCondition.GOOD,
        status: ProductStatus.PENDING_APPROVAL,
        category: this.categories[Math.floor(Math.random() * this.categories.length)],
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
        commissionRate: 0.12,
        commissionAmount: price * 0.12,
        shippingMethods: ['postnl', 'dhl']
      });
    }
  }

  getAdminMetrics() {
    const totalRevenue = this.transactions.reduce((acc, t) => acc + t.amount, 0);
    return {
      totalRevenue,
      activeProducts: this.products.filter(p => p.status === ProductStatus.ACTIVE).length,
      pendingProducts: this.products.filter(p => p.status === ProductStatus.PENDING_APPROVAL).length,
      totalItems: this.products.length,
      soldItems: this.products.filter(p => p.status === ProductStatus.SOLD).length
    };
  }

  getTransactionsByUser(userId: string) {
    return this.transactions.filter(t => t.buyerId === userId);
  }

  createTransaction(productId: string, buyer: User) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const transaction: Transaction = {
      id: `t-${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productTitle: product.title,
      buyerId: buyer.id,
      sellerId: product.sellerId,
      sellerEmail: 'seller@koop.nl',
      amount: product.price,
      commission: product.commissionAmount,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    this.transactions.push(transaction);
    this.updateProduct(productId, { status: ProductStatus.SOLD });
    return transaction;
  }

  addAddress(userId: string, address: Omit<UserAddress, 'id'>) {
    const user = this.getUser(userId);
    if (!user) return undefined;
    
    const newAddress: UserAddress = {
      ...address,
      id: `addr-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const addresses = user.addresses || [];
    return this.updateUser(userId, { 
      addresses: [...addresses, newAddress] 
    });
  }
}

export const db = new DatabaseService();
