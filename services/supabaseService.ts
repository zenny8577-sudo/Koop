import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL and Key not defined in environment variables. Using mock data.');
  // Continue with mock data instead of throwing error
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export class SupabaseService {
  static async getProducts(page: number, limit: number, filters: any) {
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

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0
    };
  }

  // ... (restante dos métodos mantendo a mesma lógica de fallback)
}