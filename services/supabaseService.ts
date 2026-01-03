import { supabase } from '../src/integrations/supabase/client';
import { Product, ProductStatus, User } from '../types';

export class SupabaseService {
  static async getProducts(page: number, limit: number, filters: any) {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('status', 'ACTIVE');

      if (filters.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.minPrice || filters.maxPrice) {
        query = query.gte('price', filters.minPrice || 0)
          .lte('price', filters.maxPrice || 10000);
      }

      if (filters.sortBy === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (filters.sortBy === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, count, error } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return {
        data: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return {
        data: [],
        total: 0
      };
    }
  }

  static async getUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }

  static async updateUser(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to update user:', error);
      return null;
    }
  }

  static async toggleWishlist(userId: string, productId: string) {
    try {
      const user = await this.getUser(userId);
      if (!user) return null;

      const wishlist = user.wishlist || [];
      const updatedWishlist = wishlist.includes(productId)
        ? wishlist.filter((id: string) => id !== productId)
        : [...wishlist, productId];

      return await this.updateUser(userId, { wishlist: updatedWishlist });
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      return null;
    }
  }

  static async createTransaction(transaction: any) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      return null;
    }
  }

  static async updateProductStatus(productId: string, status: ProductStatus) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to update product status:', error);
      return null;
    }
  }

  static async createProduct(product: any) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to create product:', error);
      return null;
    }
  }
}