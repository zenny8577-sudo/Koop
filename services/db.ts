// ... (código existente)

class DatabaseService {
  // ... (outros métodos)

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
}

// ... (exportação)