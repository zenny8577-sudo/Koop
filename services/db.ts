// Adicionar métodos de gestão de categorias
class DatabaseService {
  // ... métodos existentes
  
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
}