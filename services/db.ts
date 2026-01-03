// ... (código existente)

class DatabaseService {
  // ... (métodos existentes)

  getAllProductsAdmin(): Product[] {
    return this.products;
  }

  getAllUsers(): User[] {
    return this.users;
  }

  updateProductStatus(productId: string, status: ProductStatus) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.status = status;
    }
  }

  updateUserVerification(userId: string, status: VerificationStatus) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.verificationStatus = status;
    }
  }
}

// ... (exportação)