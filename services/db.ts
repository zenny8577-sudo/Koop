
import { Product, Transaction, Review, User, ProductStatus, UserRole, ProductCondition } from '../types';
import { mockProducts, mockTransactions, mockReviews } from './mockData';

class DatabaseService {
  private products: Product[] = [...mockProducts];
  private transactions: Transaction[] = [...mockTransactions];
  private reviews: Review[] = [...mockReviews];
  private categories: string[] = ['Elektronica', 'Design', 'Fietsen', 'Antiek', 'Gadgets'];

  getCategories() {
    return this.categories;
  }

  getReviews(productId: string) {
    return this.reviews.filter(r => r.productId === productId);
  }

  getProducts(page = 1, limit = 100, filters: any = {}) {
    let filtered = [...this.products];
    
    // Na loja pública, apenas produtos ATIVOS (aprovados) aparecem
    if (!filters.showAllStatus) {
      filtered = filtered.filter(p => p.status === ProductStatus.ACTIVE);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
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

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filtered.sort((a, b) => b.id.localeCompare(a.id));
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

  getPendingProducts() {
    return this.products.filter(p => p.status === ProductStatus.PENDING_APPROVAL);
  }

  approveProduct(id: string) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx].status = ProductStatus.ACTIVE;
    }
  }

  rejectProduct(id: string) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx].status = ProductStatus.REMOVED;
    }
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
    // Se o vendedor não for admin, o produto precisa de aprovação
    const is_admin = product.sellerId.includes('admin');
    const newProduct = { 
      ...product, 
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      status: is_admin ? ProductStatus.ACTIVE : ProductStatus.PENDING_APPROVAL,
      shippingMethods: product.shippingMethods || ['postnl']
    };
    this.products.unshift(newProduct as Product);
    return newProduct;
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
}

export const db = new DatabaseService();
