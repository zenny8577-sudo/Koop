import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL and Key not defined in environment variables. Using mock data.');
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export class SupabaseService {
  static async getProducts(page: number, limit: number, filters: any) {
    try {
      if (!supabase) {
        // Fallback to mock data
        return {
          data: [],
          total: 0
        };
      }

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

      const { data, count, error } = await query.range((page - 1) * limit, page * limit - 1);

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
      // Return empty data instead of crashing
      return {
        data: [],
        total: 0
      };
    }
  }

  static async getUser(userId: string) {
    try {
      if (!supabase) {
        return null;
      }

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
      if (!supabase) {
        return null;
      }

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
      if (!supabase) {
        return null;
      }

      // First get current user
      const user = await this.getUser(userId);
      if (!user) return null;

      // Update wishlist
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
}