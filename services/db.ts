import { Product, User, ProductStatus } from './types';

class DatabaseService {
  private products: Product[] = [];
  private users: User[] = [];
  private categories: string[] = ['Elektronica', 'Design', 'Fietsen', 'Antiek', 'Gadgets'];
  
  // ... outros métodos existentes

  // Métodos de categoria
  getCategories() {
    return this.categories;
  }

  addCategory(category: string) {
    if (!this.categories.includes(category)) {
      this.categories.push(category);
    }
  }

  removeCategory(category: string) {
    this.categories = this.categories.filter(c => c !== category);
  }

  updateCategory(oldCategory: string, newCategory: string) {
    const index = this.categories.indexOf(oldCategory);
    if (index !== -1) {
      this.categories[index] = newCategory;
    }
  }

  // ... manter outros métodos existentes
}

// Exportar instância única
export const db = new DatabaseService();