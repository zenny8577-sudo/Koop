import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be defined in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseService {
  static async getProducts(page: number, limit: number, filters: any) {
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

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0
    };
  }

  static async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createProduct(productData: any) {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...productData,
        status: 'PENDING_APPROVAL',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProductStatus(productId: string, status: string) {
    const { data, error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUser(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createTransaction(transactionData: any) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getReviews(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId);

    if (error) throw error;
    return data;
  }

  static async createReview(reviewData: any) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async toggleWishlist(userId: string, productId: string) {
    // Check if already in wishlist
    const { data: existing, error: checkError } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // Remove from wishlist
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;
      return { removed: true };
    } else {
      // Add to wishlist
      const { data, error } = await supabase
        .from('wishlist')
        .insert([{ user_id: userId, product_id: productId }])
        .select()
        .single();

      if (error) throw error;
      return { added: true, data };
    }
  }

  static async getWishlist(userId: string) {
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => item.product_id);
  }

  static async syncWooCommerce(products: any[]) {
    const { data, error } = await supabase
      .from('products')
      .insert(products.map(p => ({
        ...p,
        status: 'PENDING_APPROVAL',
        created_at: new Date().toISOString()
      })))
      .select();

    if (error) throw error;
    return data;
  }
}