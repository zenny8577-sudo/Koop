import { Product, User, ProductStatus, ProductCondition } from './types';
import { mockProducts } from './mockData';

class DatabaseService {
  private products: Product[] = mockProducts;
  private users: User[] = [];
  private transactions: any[] = [];
  private reviews: any[] = [];
  private categories: string[] = ['Elektronica', 'Design', 'Fietsen', 'Antiek', 'Gadgets'];

  constructor() {
    this.products = mockProducts;
  }

  // Add the missing getProducts method
  getProducts(page: number, pageSize: number, filters?: any) {
    let filteredProducts = [...this.products];
    
    // Apply filters
    if (filters?.category && filters.category !== 'All') {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    // Apply search
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.title.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
        default:
          filteredProducts.reverse(); // Assuming mock data is ordered by newest first
          break;
      }
    }
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      data: paginatedProducts,
      total: filteredProducts.length
    };
  }

  // Keep existing methods below...
  getCategories() {
    return this.categories;
  }

  getUser(id: string) {
    return this.users.find(u => u.id === id);
  }

  // ... (rest of the existing db.ts code)
}

export const db = new DatabaseService();